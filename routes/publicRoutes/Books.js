const {
  Book,
  User,
  SubCategories,
  BookRent,
  BookImages,
  Categories,
} = require("../../models");
const { ValidationError, where, Op, Sequelize } = require("sequelize");
const { config } = require("../../config/config");
const buildPaginationUrls = require("../../utils/buildPaginationUrls");
const db = require("../../config/db");
const router = require("express").Router();

router.route("/").get(async (req, res) => {
  try {
    const limit = req.query.limit || config.defaultLimit;
    const offset = req.query.offset || 0;

    const books = await Book.findAll({
      limit: Number(limit),
      offset: Number(offset),
      include: [
        {
          model: BookImages,
          as: "images",
          where: { isCover: true },
          attributes: ["url"],
        },
        { model: SubCategories, as: "subCat" },
        { model: BookRent, as: "rent" },
      ],
    });
    res.json({
      code: 1,
      data: { books },
      pagination: buildPaginationUrls(
        req.baseUrl,
        Number(offset),
        Number(limit),
        books.length
      ),
    });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});

router.route("/cat/:catId").get(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || config.defaultLimit;
    const offset = Number(req.query.offset) || 0;
    const catId = escape(req.params.catId);
    const books = await Book.findAll({
      where: {
        subCatId: [
          Sequelize.literal(
            `select id from subcategories where parentCategory=${catId}`
          ),
        ],
      },
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

    console.log(books);
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
});

router.route("/cat/:catId/subCat/:subCatId").get(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || config.defaultLimit;
    const offset = Number(req.query.offset) || 0;
    console.log(req.params.subCatId);
    const books = await Book.findAll({
      limit,
      offset,
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
});

router.route("/:bookId").get(async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId, {
      include: [
        {
          model: BookImages,
          as: "images",
          required: false,
          where: { isCover: true },
          attributes: ["url"],
        },
        { model: BookRent, as: "rent" },
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
});

module.exports = router;
