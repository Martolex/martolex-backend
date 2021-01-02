const {
  Book,
  User,
  SubCategories,
  BookRent,
  BookImages,
  Categories,
  BookReview,
  Tags,
} = require("../../models");
const { ValidationError, where, Op, Sequelize } = require("sequelize");
const { config } = require("../../config/config");
const buildPaginationUrls = require("../../utils/buildPaginationUrls");
const sequelize = require("../../config/db");

const BooksController = {
  searchBooks: async (req, res) => {
    try {
      const limit = req.query.limit || config.defaultLimit;
      const offset = req.query.offset || 0;
      const books = await Book.scope("available").findAll({
        limit: Number(limit),
        offset: Number(offset),

        attributes: [
          ...Object.keys(Book.rawAttributes),
          [
            Sequelize.literal(
              `(SELECT AVG(rating) FROM BookReviews AS breviews WHERE breviews.bookId = Book.id and breviews.isDeleted = 0 )`
            ),
            "rating",
          ],
          [
            Sequelize.literal(
              `match(Book.name,Book.author ,Book.publisher ) against ('${req.query.search}')`
            ),
            "relScore",
          ],
        ],
        having: { relScore: { [Op.gt]: 0 } },
        order: [sequelize.literal(`relScore desc`)],
        include: [
          {
            model: BookImages,
            as: "images",
            where: { isCover: true },
            attributes: ["url"],
          },
          {
            model: SubCategories,
            as: "subCat",
            include: {
              model: Categories,
              as: "category",
              attributes: ["name"],
            },
          },
          { model: BookRent, as: "rent" },
        ],
      });
      res.json({
        code: 1,
        data: { books },
        pagination: buildPaginationUrls(
          req.baseUrl + req.url,
          Number(offset),
          Number(limit),
          books.length,
          req.query
        ),
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  getBooksByCategory: async (req, res) => {
    try {
      const limit = Number(req.query.limit) || config.defaultLimit;
      const offset = Number(req.query.offset) || 0;

      const catId = escape(req.params.catId);
      const books = await Book.scope("available").findAll({
        limit,
        offset,
        where: {
          subCatId: [
            Sequelize.literal(
              `select id from SubCategories where parentCategory=${catId}`
            ),
          ],
        },
        attributes: [
          ...Object.keys(Book.rawAttributes),
          [
            Sequelize.literal(
              `(SELECT AVG(rating) FROM BookReviews AS breviews WHERE breviews.bookId = Book.id and breviews.isDeleted = 0 )`
            ),
            "rating",
          ],
        ],
        include: [
          {
            model: BookImages,
            as: "images",
            where: { isCover: true },
            attributes: ["url"],
            required: false,
          },
          { model: BookRent, as: "rent" },
        ],
      });

      res.json({
        code: 1,
        data: { books },
        pagination: buildPaginationUrls(
          req.baseUrl + req.url,
          Number(offset),
          Number(limit),
          books.length
        ),
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },

  getBooksBySubCategory: async (req, res) => {
    try {
      const limit = Number(req.query.limit) || config.defaultLimit;
      const offset = Number(req.query.offset) || 0;

      const books = await Book.scope("available").findAll({
        limit,
        offset,
        attributes: [
          ...Object.keys(Book.rawAttributes),
          [
            Sequelize.literal(
              `(SELECT AVG(rating) FROM BookReviews AS breviews WHERE breviews.bookId = Book.id and breviews.isDeleted = 0 )`
            ),
            "rating",
          ],
        ],
        where: { subCatId: req.params.subCatId },
        include: [
          {
            model: BookImages,
            as: "images",
            required: false,
            where: { isCover: true },
            attributes: ["url"],
          },
          { model: BookRent, as: "rent" },
        ],
      });
      res.json({
        code: 1,
        data: { books },
        pagination: buildPaginationUrls(
          req.baseUrl + req.url,
          Number(offset),
          Number(limit),
          books.length
        ),
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },

  getBookDetails: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.bookId, {
        attributes: [
          ...Object.keys(Book.rawAttributes),
          [
            Sequelize.literal(
              `(SELECT AVG(rating) FROM BookReviews AS breviews WHERE breviews.bookId = Book.id and breviews.isDeleted = 0)`
            ),
            "rating",
          ],
        ],
        include: [
          {
            model: BookImages,
            as: "images",
            required: false,
            attributes: ["url"],
          },
          { model: Tags, as: "tags" },
          { model: BookRent, as: "rent" },
          {
            model: BookReview,
            as: "reviews",
            include: { model: User, as: "user", attributes: ["name"] },
            required: false,
          },
          {
            model: SubCategories,
            as: "subCat",
            include: { model: Categories, as: "category" },
          },
        ],
      });
      res.json({
        code: 1,
        data: book,
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = BooksController;
