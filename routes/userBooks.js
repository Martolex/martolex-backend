const {
  Book,
  User,
  SubCategories,
  BookRent,
  BookReview,
  Categories,
} = require("../models");
const { ValidationError, where, Op } = require("sequelize");
const { config } = require("../config/config");
const buildPaginationUrls = require("../utils/buildPaginationUrls");

const router = require("express").Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const limit = req.query.limit || config.defaultLimit;
      const offset = req.query.offset || 0;
      const user = await User.findByPk(req.user.id);
      const books = await user.getBooks({
        order: [["createdAt", "DESC"]],
        limit: Number(limit),
        offset: Number(offset),
        include: [
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
      // console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  })
  .post(async (req, res) => {
    try {
      const {
        name,
        subCatId,
        quantity,
        isbn,
        mrp,
        deposit,
        onemonthrent,
        threemonthrent,
        sixmonthrent,
        ninemonthrent,
        twelvemonthrent,
        sellPrice,
        ...body
      } = req.body;
      if (body.isDeleted || body.isApproved) {
        res.json({ code: 0, message: "bad request" });
      }
      await Book.create(
        {
          name,
          subCatId,
          quantity,
          isbn,
          uploader: req.user.id,
          ...body,
          rent: {
            oneMonth: onemonthrent,
            threeMonth: threemonthrent,
            sixMonth: sixmonthrent,
            nineMonth: ninemonthrent,
            twelveMonth: twelvemonthrent,
            sellPrice,
            deposit,
            mrp,
          },
        },
        { include: [{ model: BookRent, as: "rent" }] }
      );

      res.json({
        code: 1,
        data: { message: "book created successfully , pending approval" },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      }
    }
  })
  .put(async (req, res) => {
    try {
      const {
        bookId,
        mrp,
        deposit,
        onemonthrent,
        threemonthrent,
        sixmonthrent,
        ninemonthrent,
        twelvemonthrent,
        sellPrice,
        ...bookDetails
      } = req.body;
      if (req.body.isDeleted || req.body.isApproved) {
        res.json({ code: 0, message: "bad request" });
      }
      await Book.update(
        {
          ...bookDetails,
          isApproved: false,
        },
        { where: { [Op.and]: [{ id: bookId }, { uploader: req.user.id }] } }
      );
      const book = await Book.findOne({
        where: { [Op.and]: [{ id: bookId }, { uploader: req.user.id }] },
      });
      const rent = await book.getRent();
      rent.oneMonth = onemonthrent;
      rent.threeMonth = threemonthrent;
      rent.sixMonth = sixmonthrent;
      rent.nineMonth = ninemonthrent;
      rent.twelveMonth = twelvemonthrent;
      rent.mrp = mrp;
      rent.sellPrice = sellPrice;
      rent.deposit = deposit;
      console.log(await rent.save());
      res.json({
        code: 1,
        data: { message: "book modified successfully, pending approval" },
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ code: 0, message: err.errors[0].message });
      }
    }
  })
  .delete(async (req, res) => {
    try {
      if (!req.body.bookId) {
        res.json({ code: 0, message: "bad request" });
      }
      await Book.update(
        { isDeleted: true },
        {
          where: {
            [Op.and]: [{ id: req.body.bookId }, { uploader: req.user.id }],
          },
        }
      );
      res.json({ code: 1, data: { message: "deleted successfully" } });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  });
router.route("/review").post(async (req, res) => {
  if (!req.body.bookId) {
    res.json({ code: 0, message: "bad request" });
  }
  try {
    await BookReview.create({
      userId: req.user.id,
      bookId: req.body.bookId,
      review: req.body.review,
      rating: req.body.rating,
    });
    res.json({
      code: 1,
      data: { message: "review submitted successfully" },
    });
  } catch (err) {
    res.json({ code: 0, message: "something went wrong" });
  }
});

router.route("/getBookNames").get(async (req, res) => {
  const { query } = req.query;
  try {
    const books = await Book.findAll({
      where: { name: { [Op.like]: `${query}%` } },
    });
    res.json({
      code: 1,
      data: books,
    });
  } catch (err) {
    // console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});

router.route("/:bookId").get(async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId, {
      attributes: ["name", "author", "publisher", "edition", "id", "isbn"],
      include: [
        { model: BookRent, as: "rent" },
        {
          model: SubCategories,
          as: "subCat",
          attributes: ["id", "name"],
          include: {
            model: Categories,
            as: "category",
            attributes: ["id", "name"],
          },
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
