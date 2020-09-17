const sequelize = require("../config/db");
const {
  UserAddress,
  Order,
  Book,
  BookRent,
  BookImages,
  Cart,
} = require("../models");
const { model } = require("../config/db");
const OrderItem = require("../models/OrderItem");
const {
  paymentModes,
  paymentStatus,
  plans,
  returnStates,
} = require("../utils/enums");
const { route } = require("./auth");
const config = require("../config/config");
const buildPaginationUrls = require("../utils/buildPaginationUrls");
const { Sequelize, where } = require("sequelize");
const { getReturnDate } = require("../utils/orderUtils");
const router = require("express").Router();

router.route("/cod").post(async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      let address;
      if (req.body.addressId) {
        address = await UserAddress.findByPk(req.body.addressId, {
          transaction: t,
        });
        // console.log(address);
      } else {
        address = await UserAddress.create(
          {
            ...req.body.address,
            userId: req.user.id,
          },
          {
            transaction: t,
          }
        );
      }

      await Promise.all(
        req.body.items.map((item) =>
          Book.update(
            { quantity: Sequelize.literal(`quantity - ${item.qty}`) },
            { where: { id: item.bookId } }
          )
        )
      );

      const itemsList = req.body.items.map((item) => ({
        ...item,
        returnDate: getReturnDate(item.plan),
        isReturned:
          item.plan == plans.SELL
            ? returnStates.NOT_ELIGIBLE
            : returnStates.NOT_RETURNED,
      }));

      const items = await OrderItem.bulkCreate(itemsList, {
        transaction: t,
      });

      Cart.destroy({ where: { userId: req.user.id } });

      let order = await Order.create(
        {
          paymentMode: paymentModes.COD,

          userId: req.user.id,
          userAddress: address,
          deliveryAmount: req.body.deliveryAmount,
          deliveryMinDate: new Date().getTime() + 5 * 24 * 60 * 60 * 1000,
          deliveryMaxDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
        },
        { transaction: t }
      );
      order.setAddress(address);
      order.setItems(items);
      return order;
    });

    res.json({
      code: 1,
      data: { message: "Order created successfully", orderId: result.id },
    });
  } catch (err) {
    console.log(err);
    res.json({
      code: 0,
      message: "Your request could not be completed at the moment",
    });
  }
});

router.route("/online").post(async (req, res) => {
  res.status(501).json({ code: 1, message: "not yet implemented" });
});

router.route("/").get(async (req, res) => {
  console.log("abcd");
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
    res.json({
      code: 1,
      data: orders,
    });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});

router.route("/:id").get(async (req, res) => {
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
});
module.exports = router;
