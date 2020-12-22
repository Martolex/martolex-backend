const { Op } = require("sequelize");
const { Book, OrderItem, Order, UserAddress } = require("../../models");

const OrdersController = {
  getOrders: async (req, res) => {
    try {
      const orders = await OrderItem.findAll({
        where: { "$Book.uploader$": req.user.id },
        attributes: { exclude: ["updatedAt", "orderId", "bookId", "id"] },
        include: [
          { model: Book, as: "book", attributes: ["id", "name", "author"] },
        ],
      });
      res.json({ code: 1, data: orders });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: err });
    }
  },
  getOrdersByAd: async (req, res) => {
    try {
      const orders = await Book.findByPk(req.params.id, {
        attributes: ["id", "name", "author"],
        include: [
          {
            model: OrderItem,
            as: "ordered",
            required: false,
            where: { returnDate: { [Op.gte]: new Date() } },
            attributes: { exclude: ["updatedAt", "orderId", "bookId", "id"] },
            include: {
              model: Order,
              as: "order",
              attributes: ["id"],
              include: [
                {
                  model: UserAddress,
                  as: "address",
                  attributes: {
                    exclude: ["id", "createdAt", "updatedAt", "UserId"],
                  },
                },
              ],
            },
          },
        ],
      });
      res.json({ code: 1, data: orders });
    } catch (err) {
      res.json({ code: 0, message: err });
    }
  },
};

module.exports = OrdersController;
