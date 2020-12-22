const { BookReview, User, Book } = require("../../models");

const ReviewsController = {
  getReviews: async (req, res) => {
    try {
      const reviews = await BookReview.findAll({
        attributes: ["id", "review", "rating", "createdAt"],
        order: [["createdAt", "DESC"]],
        include: [
          { model: Book, as: "book", attributes: ["id", "name"] },
          { model: User, as: "user", attributes: ["id", "name"] },
        ],
      });
      res.json({ code: 1, data: reviews });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },

  deleteReview: async (req, res) => {
    try {
      if (!req.body.id) {
        res.status(400).json({ code: 0, message: "bad request" });
      }
      const { id } = req.body;
      await BookReview.update({ isDeleted: true }, { where: { id } });
      res.json({ code: 1, data: { message: "review Deleted successfully" } });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = ReviewsController;
