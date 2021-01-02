const {
  Book,
  SubCategories,
  BookRent,
  Categories,
  User,
  BookImages,
} = require("../../models");
const { approvalStates } = require("../../utils/enums");
const { ValidationError, Sequelize } = require("sequelize");

const BookController = {
  thirdParty: {
    getApprovedBooks: async (req, res) => {
      try {
        const books = await Book.findAll({
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name", "author", "publisher", "quantity"],
          where: { isApproved: approvalStates.APPROVED },

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
            {
              model: User,
              as: "upload",
              attributes: ["name", "id"],
              where: { isAdmin: false },
              required: true,
            },
          ],
        });
        res.json({ code: 1, data: books });
      } catch (err) {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    },

    approveBook: async (req, res) => {
      try {
        const { bookId, status } = req.body;
        const approvalStatus = status.toUpperCase();
        if (!["APPROVED", "NOT_APPROVED"].includes(approvalStatus)) {
          res.json({ code: 0, message: "not a valid status" });
        }
        // call the email lambda with the status and reason if not approved

        await Book.update(
          { isApproved: approvalStates[approvalStatus] },
          { where: { id: bookId } }
        );
        if (approvalStates[approvalStatus] == approvalStates.APPROVED) {
          res.json({ code: 1, data: { message: "book approved" } });
        } else {
          res.json({ code: 1, data: { message: "Rejection Recorded" } });
        }
      } catch (err) {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    },
    getBooksPendingApproval: async (req, res) => {
      try {
        const books = await Book.findAll({
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name", "author", "publisher", "quantity"],
          where: { isApproved: approvalStates.PENDING },
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
            {
              model: User,
              as: "upload",
              attributes: ["name", "id"],
              where: { isAdmin: false },
              required: true,
            },
          ],
        });
        res.json({ code: 1, data: books });
      } catch (err) {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    },
    getBooksNotApproved: async (req, res) => {
      try {
        const books = await Book.findAll({
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name", "author", "publisher", "quantity"],
          where: { isApproved: approvalStates.NOT_APPROVED },

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
            {
              model: User,
              as: "upload",
              attributes: ["name", "id"],
              where: { isAdmin: false },
              required: true,
            },
          ],
        });
        res.json({ code: 1, data: books });
      } catch (err) {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    },
  },
  martolex: {
    getBooks: async (req, res) => {
      try {
        const books = await Book.findAll({
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name", "author", "publisher", "quantity"],

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
        });
      } catch (err) {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    },
    addBook: async (req, res) => {
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
    },
    modifyBook: async (req, res) => {
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
        await rent.save();
        res.json({
          code: 1,
          data: { message: "book modified successfully" },
        });
      } catch (err) {
        if (err instanceof ValidationError) {
          res.json({ code: 0, message: err.errors[0].message });
        }
      }
    },
    deleteBook: async (req, res) => {
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
    },
  },
  commons: {
    getBookDetails: async (req, res) => {
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
    },
  },
};

module.exports = BookController;
