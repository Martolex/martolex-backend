const { Cart, Book, User } = require("../models");
const { config } = require("../config/config");
const { ValidationError, Op } = require("sequelize");
const { createCartItem } = require("../models/Mappers/CartItemMapper");
const CartService = require("../services/CartService");

const CartController = {
  getUserCart: async (req, res) => {
    try {
      let cart = await CartService.getUserCart(req.user.id, { images: true });
      cart = cart.map((item) => {
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
      const newCartItem = await CartService.addItemToCart(req.user.id, {
        BookId: bookId,
        plan,
        qty,
      });
      res.json({
        code: 1,
        data: {
          message: "item added successfully to cart",
          item: createCartItem(newCartItem),
        },
      });
    } catch (err) {
      res.json({ code: 0, message: err.message });
    }
  },

  removeFromCart: async (req, res) => {
    if (!req.body.bookId) {
      res.json({ code: 0, message: "badd request" });
    } else {
      try {
        await CartService.removeItem(req.user.id, req.body.bookId);
        res.json({
          code: 1,
          data: { message: "cartItem removed Successfully" },
        });
      } catch (err) {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  modifyPlan: async (req, res) => {
    const { bookId, plan } = req.body;
    if (!bookId || !plan) {
      res.json({ code: 0, message: "badd request" });
      return;
    }
    try {
      await CartService.modifyPlan(req.user.id, bookId, plan);
      res.json({ code: 1, data: { message: "plan modified Successfully" } });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: err.message });
      }
    }
  },
  modifyQty: async (req, res) => {
    const { bookId, qty = req.body };
    if (!bookId || !qty || qty < 1) {
      res.json({ code: 0, message: "badd request" });
      return;
    }
    try {
      await CartService.modifyQty(req.user.id);
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
      const deliveryCharge = await CartService.computeDeliveryCharge(
        req.user.id
      );
      res.json({ code: 1, data: deliveryCharge });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = CartController;
