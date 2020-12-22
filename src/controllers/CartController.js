const { Cart, Book, BookRent, BookImages, User } = require("../models");
const { config } = require("../config/config");
const buildPaginationUrls = require("../utils/buildPaginationUrls");
const { ValidationError, Sequelize, Op } = require("sequelize");
const { createCartItem } = require("../models/Mappers/CartItemMapper");

const CartController = {
  getUserCart: async (req, res) => {
    try {
      let cart = await Cart.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "ASC"]],
        include: {
          model: Book,
          as: "book",
          attributes: ["name"],
          include: [
            { model: BookRent, as: "rent" },
            {
              model: BookImages,
              attributes: ["url"],
              as: "images",
              required: false,
              where: { isCover: true },
            },
          ],
        },
      });
      cart = cart
        .map((cartItem) => cartItem.toJSON())
        .map((item) => {
          return createCartItem(item);
        });
      res.json({
        code: 1,
        data: cart,
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  addToCart: async (req, res) => {
    if (
      !req.body.bookId ||
      !req.body.plan ||
      !req.body.qty ||
      req.body.isDeleted
    ) {
      res.json({ code: 0, message: "bad request" });
    }
    const { bookId, plan, qty } = req.body;
    try {
      const newCartItem = await Cart.create({
        qty,
        plan,
        BookId: bookId,
        userId: req.user.id,
      });
      await newCartItem.reload({
        include: {
          model: Book,
          as: "book",
          include: [
            { model: BookRent, as: "rent" },
            {
              model: BookImages,
              attributes: ["url"],
              as: "images",
              required: false,
              where: { isCover: true },
            },
          ],
        },
      });
      res.json({
        code: 1,
        data: {
          message: "item added successfully to cart",
          item: createCartItem(newCartItem.toJSON()),
        },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        if (err.errors[0].path == "carts__book_id_user_id") {
          await Cart.update(
            { qty: Sequelize.literal(`qty + ${qty}`) },
            {
              where: {
                [Op.and]: [{ BookId: bookId }, { userId: req.user.id }],
              },
            }
          );

          res.json({
            code: 1,
            data: { message: "item added successfully to cart" },
          });
        } else {
          res.json({ code: 0, message: err.errors[0].message });
        }
      }
    }
  },

  removeFromCart: async (req, res) => {
    if (!req.body.bookId) {
      res.json({ code: 0, message: "badd request" });
    }
    try {
      await Cart.destroy({
        where: {
          [Op.and]: [{ BookId: req.body.bookId }, { userId: req.user.id }],
        },
      });
      res.json({ code: 1, data: { message: "cartItem removed Successfully" } });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  modifyPlan: async (req, res) => {
    if (!req.body.bookId || !req.body.plan) {
      res.json({ code: 0, message: "badd request" });
    }
    try {
      await Cart.update(
        { plan: req.body.plan },
        {
          where: {
            [Op.and]: [{ BookId: req.body.bookId }, { userId: req.user.id }],
          },
        }
      );
      res.json({ code: 1, data: { message: "plan modified Successfully" } });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  modifyQty: async (req, res) => {
    if (
      !req.body.bookId ||
      !req.body.plan ||
      !req.body.qty ||
      req.body.qty < 1
    ) {
      res.json({ code: 0, message: "badd request" });
    }
    try {
      await Cart.update(
        { qty: req.body.qty },
        {
          where: {
            [Op.and]: [{ BookId: req.body.bookId }, { userId: req.user.id }],
          },
        }
      );
      res.json({
        code: 1,
        data: { message: "quantity modified Successfully" },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  computeDeliveryCharges: async (req, res) => {
    try {
      const NoDeliveryCharge = { forward: 0, return: 0 };
      const cart = await Cart.findAll({
        where: { userId: req.user.id },
        attributes: ["id"],
        include: {
          model: Book,
          as: "book",
          attributes: ["id"],
          include: { model: User, as: "upload", attributes: ["id", "isAdmin"] },
        },
      });
      if (cart.some((item) => item.book.upload.isAdmin)) {
        res.json({ code: 1, data: config.deliveryCharge });
      } else {
        res.json({ code: 1, data: NoDeliveryCharge });
      }
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = CartController;
