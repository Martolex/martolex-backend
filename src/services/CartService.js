const { ValidationError, Sequelize, where } = require("sequelize");
const { Cart, Book, BookRent, BookImages, User } = require("../models");
const { plans } = require("../utils/enums");
const { config } = require("../config/config");
class CartService {
  constructor() {
    this._baseAttributes = ["plan", "id", "qty"];
  }
  async _fetchCartItem(id) {
    const cartItem = await Cart.findByPk(id, {
      attributes: this._baseAttributes,
      include: {
        model: Book,
        as: "book",
        attributes: { exclude: ["description"] },
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
    return cartItem;
  }

  async addItemToCart(userId, item, options = {}) {
    let cartItem;
    try {
      cartItem = await Cart.create({
        qty: item.qty,
        plan: item.plan,
        BookId: item.BookId,
        userId,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        if (err.errors[0].path == "carts__book_id_user_id") {
          cartItem = await Cart.findOne({
            attributes: ["id", "qty"],
            where: {
              BookId: item.BookId,
              userId,
            },
          });
          cartItem.qty += item.qty;
          await cartItem.save();
        }
      }
    }
    const cartItemDetails = await this._fetchCartItem(cartItem.id);
    return cartItemDetails.toJSON();
  }
  async getUserCart(userId, options = {}) {
    const { images, bookAttributes = [] } = options;
    const cart = await Cart.findAll({
      where: { userId },
      attributes: this._baseAttributes,
      order: [["createdAt", "DESC"]],
      include: {
        model: Book,
        as: "book",
        attributes: [...new Set(["name", "id", ...bookAttributes])],
        include: [
          { model: BookRent, as: "rent" },
          images && {
            model: BookImages,
            attributes: ["url"],
            as: "images",
            required: false,
            where: { isCover: true },
          },
        ],
      },
    });

    return cart.map((cartItem) => cartItem.toJSON());
  }

  async removeItem(userId, BookId) {
    await Cart.destroy({ where: userId, BookId });
  }

  async modifyPlan(userId, BookId, plan) {
    if (!Object.values(plans).includes(plan)) {
      throw new Error("invalid plan");
    }
    await Cart.update({ plan }, { where: { userId, BookId } });
  }

  async modifyQty(userId, BookId, qty) {
    await Cart.update({ qty }, { where: { userId, BookId } });
  }

  async computeDeliveryCharge(userId) {
    let deliveryCharge = { forward: 0, return: 0 };
    const cart = await Cart.findAll({
      where: { userId: userId },
      attributes: ["id"],
      include: {
        model: Book,
        as: "book",
        attributes: ["id"],
        include: { model: User, as: "upload", attributes: ["isAdmin"] },
      },
    });
    if (cart.some((item) => item.book.upload.isAdmin)) {
      deliveryCharge = config.deliveryCharge;
    }
    return deliveryCharge;
  }

  async cartStats() {
    return await User.findAll({
      group: ["id"],
      attributes: [
        "id",
        "name",
        "email",
        "phoneNo",
        [Sequelize.fn("count", Sequelize.col("cartItems.id")), "itemCount"],
      ],
      include: {
        model: Cart,
        as: "cartItems",
        required: true,
        attributes: [],
      },
    });
  }
}

module.exports = new CartService();
