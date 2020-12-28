const { NotFoundBook } = require("../models");
const buildPaginationUrls = require("../utils/buildPaginationUrls");
const { config } = require("../config/config");

const BooksNotFoundController = {
  createBookRequest: async (req, res) => {
    try {
      await NotFoundBook.create({ ...req.body });
      res.json({
        code: 1,
        data: {
          message:
            "your request is accepted. Our team will get back to you soon.",
        },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  getBookRequests: async (req, res) => {
    try {
      const books = await NotFoundBook.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.json({ code: 1, data: books });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = BooksNotFoundController;
