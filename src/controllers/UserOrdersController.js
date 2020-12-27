const sequelize = require("../config/db");
const {
  UserAddress,
  Order,
  Book,
  BookRent,
  BookImages,
  Cart,
  User,
} = require("../models");
const OrderItem = require("../models/OrderItem");
const {
  paymentModes,
  paymentStatus,
  plans,
  returnStates,
} = require("../utils/enums");
const { config } = require("../config/config");
const buildPaginationUrls = require("../utils/buildPaginationUrls");
const { Sequelize, where, Op } = require("sequelize");
const { getReturnDate, OrderTotal } = require("../utils/orderUtils");
const AWS = require("aws-sdk");
const { v4: UUIDV4 } = require("uuid");
const getPaymentLink = require("../utils/Payments/getPaymentLink");

AWS.config.update({ region: "ap-south-1" });
const Lambda = new AWS.Lambda();

const getGroupedItems = async (items) => {
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
};

const UserOrdersController = {
  createOrder: async (req, res) => {
    try {
      const result = await sequelize.transaction(async (t) => {
        let addressPromise;
        if (req.body.addressId) {
          addressPromise = UserAddress.findByPk(req.body.addressId, {
            transaction: t,
          });
        } else {
          addressPromise = UserAddress.create(
            {
              ...req.body.address,
              UserId: req.user.id,
            },
            {
              transaction: t,
            }
          );
        }

        const userPromise = User.findByPk(req.user.id, {
          attributes: ["email"],
        });

        const [address, user] = await Promise.all([
          addressPromise,
          userPromise,
        ]);

        await Promise.all(
          req.body.items.map((item) =>
            Book.update(
              { quantity: Sequelize.literal(`quantity - ${item.qty}`) },
              { where: { id: item.bookId } }
            )
          )
        );
        const orderTotal =
          OrderTotal(req.body.items) +
          config.deliveryCharge.forward +
          config.deliveryCharge.return;
        const itemsList = req.body.items.map((item) => ({
          ...item,
          returnDate: getReturnDate(item.plan),
          isReturned:
            item.plan == plans.SELL
              ? returnStates.NOT_ELIGIBLE
              : returnStates.NOT_RETURNED,
        }));

        const groupedItems = await getGroupedItems(itemsList);
        const gatewayOrderId = UUIDV4();
        const Orderpromises = Object.values(groupedItems).map(
          async ({ items: itemList, isThirdparty }) => {
            const items = await OrderItem.bulkCreate(itemList, {
              transaction: t,
            });

            let order = await Order.create(
              {
                paymentMode: paymentModes.CASHFREE,

                userId: req.user.id,
                userAddress: address,
                gatewayOrderId: gatewayOrderId,
                referralCode: req.body.referralCode,
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
            if (config.env != "dev") {
              const params = {
                FunctionName: "email-service",
                InvocationType: "RequestResponse",
                Payload: `{ "type":"ORDER_RECEIPT" , orderId" : "${order.id}" }`,
              };
              Lambda.invoke(params, (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(data);
                }
              });
            }
            if (isThirdparty) {
              //send sms to seller and buyer for details
            }
            return order.id;
          }
        );
        const orderIds = await Promise.all(Orderpromises);
        const paymentLink = await getPaymentLink(gatewayOrderId, {
          orderIds,
          orderAmount: orderTotal,
          customerEmail: user.email,
          customerPhone: address.phoneNo,
          customerName: address.name,
        });
        return { orderIds, paymentLink };
      });

      Cart.destroy({ where: { userId: req.user.id } });

      res.json({
        code: 1,
        data: {
          message: "Order created successfully",
          orderIds: result.orderIds,
          paymentLink: result.paymentLink,
        },
      });
    } catch (err) {
      console.log(err);
      res.json({
        code: 0,
        message: "Your request could not be completed at the moment",
      });
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
        include: [
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
      res.json({
        code: 1,
        data: orders,
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  getOrderAddress: async (req, res) => {
    try {
      if (req.query.orderId) {
        const order = await Order.findByPk(req.query.orderId, {
          attributes: ["id"],

          include: [
            { model: User, as: "user", attributes: ["id"] },
            { model: UserAddress, as: "address" },
          ],
        });
        if (order) {
          if (order.user.id == req.user.id) {
            res.json({ code: 1, data: order.address });
          } else {
            res.status(401).json({
              code: 0,
              message: "You are not authorized to access this order ",
            });
          }
        } else {
          res.json({ code: 0, message: "order does not exist" });
        }
      } else {
        res.json({ code: 1 });
      }
    } catch (err) {
      res.json({ code: 0, message: " something went wrong" });
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
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
      res.json({ code: 1, data: order });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },

  requestItemReturn: async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;
    try {
      const item = await OrderItem.findByPk(itemId, {
        include: {
          model: Order,
          as: "order",
          attributes: ["id"],
          include: { model: User, as: "user", attributes: ["id"] },
        },
      });
      if (item) {
        if (item.order.user.id === req.user.id) {
          item.isReturned = returnStates.RETURN_REQUESTED;
          item.returnRequestDate = new Date.now();
          await item.save();
          res.json({
            code: 1,
            data: { message: "Return request submitted successfully" },
          });
        } else {
          res.status(401).json({
            code: 0,
            message: "You are not authorized to return this order ",
          });
        }
      } else {
        res.json({ code: 0, message: "item does not exist" });
      }
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  cancelReturnRequest: async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;
    try {
      const item = await OrderItem.findByPk(itemId, {
        include: {
          model: Order,
          as: "order",
          attributes: ["id"],
          include: { model: User, as: "user", attributes: ["id"] },
        },
      });
      if (item) {
        if (item.order.user.id === req.user.id) {
          const returnDate = new Date(item.returnDate);
          item.isReturned = returnStates.NOT_RETURNED;
          await item.save();
          if (returnDate.getTime() < Date.now()) {
            res.json({
              code: 1,
              data: {
                message:
                  "Return request cancelled. You cannot return your book now as the return period had expired",
              },
            });
          } else {
            res.json({
              code: 1,
              data: { message: "Return request cancelled" },
            });
          }
        } else {
          res.status(401).json({
            code: 0,
            message: "You are not authorized to return this order ",
          });
        }
      } else {
        res.json({ code: 0, message: "item does not exist" });
      }
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  retryPayment: async (req, res) => {
    const { orderId } = req.body;
    console.log(orderId);
    try {
      const order = await Order.findOne({
        where: {
          id: orderId,
          userId: req.user.id,
        },
      });
      if (order) {
        if (order.paymentStatus !== paymentStatus.PAID) {
          const paymentLink = await getPaymentLink(order.gatewayOrderId, {
            existing: true,
          });
          res.json({ code: 1, data: { paymentLink } });
        } else {
          res.json({ code: 0, message: "Payment already done" });
        }
      } else {
        res.json({ code: 0, message: "invalid orderId" });
      }
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong. Try again later" });
    }
  },
};

module.exports = UserOrdersController;
