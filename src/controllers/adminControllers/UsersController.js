const { User, Cart, Book, BookRent } = require("../../models");
const Sequelize = require("sequelize");
const CartService = require("../../services/CartService");

const UsersController = {
  getAllUsers: async (req, res) => {
    try {
      const isSeller = req.query.isSeller == "true";
      let filters = { isAdmin: false };

      if (isSeller) filters.isSeller = true;

      const users = await User.findAll({
        where: filters,
        attributes: ["id", "name", "email", "phoneNo", "isSeller"],
      });
      res.json({ code: 1, data: users });
    } catch (err) {
      res.json({ code: 0, message: "Something went wrong" });
    }
  },

  getUserCart: async (req, res) => {
    try {
      const userCart = CartService.getUserCart(req.params.id, {
        images: false,
        bookAttributes: [
          "name",
          "author",
          "id",
          "publisher",
          "isbn",
          "edition",
        ],
      });
      res.json({ code: 1, data: userCart });
    } catch (err) {
      res.json({ code: 0, message: "Something went wrong" });
    }
  },
  cartStats: async (req, res) => {
    try {
      const userCarts = await CartService.cartStats();
      res.json({ code: 1, data: userCarts });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = UsersController;
