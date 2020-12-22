const { User, Cart, Book, BookRent } = require("../../models");
const Sequelize = require("sequelize");

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
      const userCart = await Cart.findAll({
        where: { userId: req.params.id },
        attributes: ["plan", "id", "qty"],
        order: [["createdAt", "DESC"]],
        include: {
          model: Book,
          attributes: ["name", "author", "id", "publisher", "isbn", "edition"],
          as: "book",
          include: {
            model: User,
            as: "upload",
            attributes: ["id", "name", "isAdmin"],
          },
        },
      });

      res.json({ code: 1, data: userCart });
    } catch (err) {
      res.json({ code: 0, message: "Something went wrong" });
    }
  },
  cartStats: async (req, res) => {
    try {
      const userCarts = await User.findAll({
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
      res.json({ code: 1, data: userCarts });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = UsersController;
