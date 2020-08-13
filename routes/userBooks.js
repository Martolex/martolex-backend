const { Book, User, SubCategories, BookRent } = require("../models");
const { ValidationError, where, Op } = require("sequelize");

const router = require("express").Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      const books = await user.getBooks({
        where: { isDeleted: false },
        include: [
          { model: SubCategories, as: "subCat" },
          { model: BookRent, as: "rent" },
        ],
      });
      res.json({ code: 1, data: { books } });
    } catch (err) {
      console.log(err);
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
module.exports = router;
