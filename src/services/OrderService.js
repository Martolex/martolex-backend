const { config } = require("../config/config");
const sequelize = require("../config/db");
const {
  Book,
  Order,
  User,
  OrderItem,
  Cart,
  BookImages,
  UserAddress,
} = require("../models");
const orderUtils = require("../utils/orderUtils");
const { plans, returnStates, paymentModes } = require("../utils/enums");
const { v4: UUIDV4 } = require("uuid");
const getPaymentLink = require("../utils/Payments/getPaymentLink");
const Sequelize = require("sequelize");
const PermissionError = require("../Exceptions/PermissionError");

class OrderService {
  async getAll() {
    return await Order.findAll();
  }

  async getAmbassadorOrders(ambassadorId) {
    ambassadorId = sequelize.escape(ambassadorId);
    const leadsSubQuery = `(Select email from Leads where ambassador=${ambassadorId})`;
    const orders = Order.findAll({
      include: {
        model: User,
        as: "user",
        attributes: [],
        required: true,
        where: {
          email: { [Sequelize.Op.in]: Sequelize.literal(leadsSubQuery) },
        },
      },
    });
    return orders;
  }
  async getSellerOrders({ sellerId }) {
    const orders = await Order.findAll({
      include: {
        model: OrderItem,
        as: "items",
        required: true,
        include: {
          model: Book,
          as: "book",
          where: { uploader: sellerId },
          required: true,
        },
      },
    });
    return orders;
  }

  async getorderItems(id) {
    return await OrderItem.findAll({ where: { orderId: id } });
  }
  async findById(id, options = {}) {
    const { flat } = options;
    return await Order.findByPk(id, {
      include: !flat && [
        { model: UserAddress, as: "address" },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Book,
            as: "book",
            include: [
              {
                model: BookRent,
                as: "rent",
              },
              {
                model: BookImages,
                as: "images",
                required: false,
                attributes: ["url"],
                where: { isCover: 1 },
              },
            ],
          },
        },
      ],
    });
  }
  async _groupItemsBySeller(items) {
    try {
      const promises = items.map((item) =>
        Book.findByPk(item.bookId, {
          attributes: ["id", "uploader"],
          include: { model: User, as: "upload", attributes: ["isAdmin", "id"] },
        })
      );
      const books = await Promise.all(promises);

      const grouped = books.reduce(
        (grouped, book, idx) =>
          grouped[book.upload.id]
            ? {
                ...grouped,
                [book.upload.id]: {
                  ...grouped[book.upload.id],
                  items: [...grouped[book.upload.id].items, items[idx]],
                },
              }
            : {
                ...grouped,
                [book.upload.id]: {
                  isThirdparty: !book.upload.isAdmin,
                  items: [items[idx]],
                },
              },
        {}
      );
      return grouped;
    } catch (err) {
      console.log(err);
    }
  }

  async createOrder(items, user, address, options = {}) {
    const result = await sequelize.transaction(async (t) => {
      //reduce quantity of all items from order in inventory
      await Promise.all(
        items.map((item) =>
          Book.update(
            { quantity: Sequelize.literal(`quantity - ${item.qty}`) },
            { where: { id: item.bookId }, transaction: t }
          )
        )
      );

      //calculate order amount
      const orderAmount =
        orderUtils.OrderTotal(items) +
        config.deliveryCharge.forward +
        config.deliveryCharge.return;
      const itemsList = items.map((item) => ({
        ...item,
        returnDate: orderUtils.getReturnDate(item.plan),
        isReturned:
          item.plan == plans.SELL
            ? returnStates.NOT_ELIGIBLE
            : returnStates.NOT_RETURNED,
      }));

      const groupedItems = await this._groupItemsBySeller(itemsList);
      const gatewayOrderId = UUIDV4();
      const Orderpromises = Object.values(groupedItems).map(
        async ({ items: itemList, isThirdparty }) => {
          const items = await OrderItem.bulkCreate(itemList, {
            transaction: t,
          });

          let order = await Order.create(
            {
              paymentMode: paymentModes.CASHFREE,

              userId: user.id,
              userAddress: address,
              gatewayOrderId: gatewayOrderId,
              referralCode: options.referralCode,
              deliveryAmount: !isThirdparty
                ? config.deliveryCharge.forward + config.deliveryCharge.return
                : 0,
              deliveryMinDate: new Date().getTime() + 5 * 24 * 60 * 60 * 1000,
              deliveryMaxDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
            },
            { transaction: t }
          );
          order.setAddress(address);
          order.setItems(items);

          if (isThirdparty) {
            //send sms to seller and buyer for details
          }
          return order.id;
        }
      );
      const orderIds = await Promise.all(Orderpromises);
      const paymentLink = await getPaymentLink(gatewayOrderId, {
        orderIds,
        orderAmount,
        customerEmail: user.email,
        customerPhone: address.phoneNo,
        customerName: address.name,
      });
      return { orderIds, paymentLink };
    });

    Cart.destroy({ where: { userId: user.id } });
    return result;
  }

  async getOrdersByBook(bookId) {
    let orders = await OrderItem.findAll({
      where: { bookId },
      include: { model: Order, as: "order" },
    });
    return orders.map((item) => item.toJSON().order);
  }

  async getUserOrders(userId, options = {}) {
    const { flat = false } = options;
    const orders = await Order.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: !flat && [
        {
          model: OrderItem,
          as: "items",
          order: ["isReturned", "desc"],
          attributes: {
            exclude: ["createdAt", "updatedAt", "orderId", "bookId"],
          },
          include: {
            model: Book,
            as: "book",
            attributes: ["id", "name"],
            include: [
              {
                model: BookImages,
                as: "images",
                required: false,
                attributes: ["url"],
                where: { isCover: 1 },
              },
            ],
          },
        },
      ],
    });
    return orders;
  }

  async getOrderAddress(orderId, userId) {
    if (!orderId) throw new TypeError("orderId not specified");
    const order = await Order.findByPk(orderId, {
      attributes: ["id"],

      include: [
        { model: User, as: "user", attributes: ["id"] },
        { model: UserAddress, as: "address" },
      ],
    });
    if (!order) throw new TypeError("order does not exist");
    if (order.user.id !== userId)
      throw new PermissionError("not authorized to access this transaction");

    return order.address;
  }

  async findOrderItemById(id) {
    return await OrderItem.findByPk(id);
  }
}

module.exports = new OrderService();
