const {
  Book,
  SubCategories,
  BookRent,
  Categories,
  User,
  BookImages,
  BookReview,
} = require("../../models");
const buildPaginationUrls = require("../../utils/buildPaginationUrls");
const { ValidationError, Sequelize } = require("sequelize");
const router = require("express").Router();

router.route("/thirdParty/approved").get(async (req, res) => {
  try {
    const limit = Number(req.query.limit) || config.defaultLimit;
    const offset = Number(req.query.offset) || 0;
    const books = await Book.findAll({
      where: { isApproved: true },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        { model: SubCategories, as: "subCat" },
        { model: BookRent, as: "rent" },
      ],
    });
    res.json({
      code: 1,
      data: { books },
      pagination: buildPaginationUrls(
        req.originalUrl.split("?")[0],
        offset,
        limit,
        books.length
      ),
    });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});
router
  .route("/thirdParty/notApproved")
  .get(async (req, res) => {
    try {
      const limit = Number(req.query.limit) || config.defaultLimit;
      const offset = Number(req.query.offset) || 0;
      const books = await Book.findAll({
        where: { isApproved: false },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        include: [
          { model: SubCategories, as: "subCat" },
          { model: BookRent, as: "rent" },
        ],
      });
      res.json({
        code: 1,
        data: { books },
        pagination: buildPaginationUrls(
          req.originalUrl.split("?")[0],
          offset,
          limit,
          books.length
        ),
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  })
  .post(async (req, res) => {
    try {
      const { bookId } = req.body;
      await Book.update({ isApproved: true }, { where: { id: bookId } });
      res.json({ code: 1, data: { message: "book approved" } });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  });

router
  .route("/martolex")
  .get(async (req, res) => {
    try {
      // const limit = Number(req.query.limit) || config.defaultLimit;
      // const offset = Number(req.query.offset) || 0;
      const books = await Book.findAll({
        order: [["createdAt", "DESC"]],
        attributes: ["id", "name", "author", "publisher", "quantity"],
        // limit,
        // offset,
        include: [
          {
            model: SubCategories,
            as: "subCat",
            attributes: ["name", "id"],
            include: {
              model: Categories,
              as: "category",
              attributes: ["id", "name"],
            },
          },
          // { model: BookRent, as: "rent" },
          {
            model: User,
            as: "upload",
            attributes: [],
            where: { isAdmin: true },
            required: true,
          },
        ],
      });
      res.json({
        code: 1,
        data: books,
        // pagination: buildPaginationUrls(
        //   req.originalUrl.split("?")[0],
        //   offset,
        //   limit,
        //   books.length
        // ),
      });
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
          isApproved: true,
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
      rent.sellPrice = sellPrice;
      rent.mrp = mrp;
      rent.deposit = deposit;
      console.log(await rent.save());
      res.json({
        code: 1,
        data: { message: "book modified successfully" },
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
            id: req.body.bookId,
          },
        }
      );
      res.json({ code: 1, data: { message: "deleted successfully" } });
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  });

router.route("/:bookId").get(async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId, {
      attributes: [
        ...Object.keys(Book.rawAttributes),
        [
          Sequelize.literal(
            `(SELECT avg(rating)  FROM BookReviews AS breviews WHERE breviews.bookId = Book.id )`
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

        { model: BookRent, as: "rent" },
        {
          model: BookReview,
          as: "reviews",
          include: { model: User, as: "user", attributes: ["name"] },
        },
        {
          model: SubCategories,
          as: "subCat",
          include: { model: Categories, as: "category" },
        },
        {
          model: User,
          as: "upload",
          attributes: ["name", "email", "id", "isAdmin"],
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
