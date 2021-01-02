const {
  Book,
  User,
  SubCategories,
  BookRent,
  BookReview,
  Categories,
  BookImages,
  Tags,
} = require("../models");
const { ValidationError, where, Op } = require("sequelize");
const { config } = require("../config/config");
const buildPaginationUrls = require("../utils/buildPaginationUrls");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new aws.S3();

const UserBooksController = {
  getUserBooks: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      const books = await user.getBooks({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: BookImages,
            as: "images",
            required: false,
            where: { isCover: true },
            attributes: ["url"],
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
  createBook: async (req, res) => {
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
          images: [
            { url: body.frontCover, isCover: true },
            { url: body.backCover },
            { url: body.frontPage },
            ...body.otherImgs.map((url) => ({
              url,
            })),
          ],
          tags: (body.tags || []).map((tag) => ({ tag })),
        },
        {
          include: [
            { model: BookRent, as: "rent" },
            { model: BookImages, as: "images" },
            { model: Tags, as: "tags" },
          ],
        }
      );

      res.json({
        code: 1,
        data: { message: "book created successfully , pending approval" },
      });
    } catch (err) {
      console.log(err);
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
  },
  deleteBook: async (req, res) => {
    try {
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
  },

  addReview: async (req, res) => {
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
  },

  searchBookNames: async (req, res) => {
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
      res.json({ code: 0, message: "something went wrong" });
    }
  },

  getBookDetails: async (req, res) => {
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
  },

  generateBookImageUploadSignedUrl: async (req, res) => {
    const S3_BUCKET = config.imagesS3Bucket;

    const fileType = req.body.fileType;
    const tag = req.body.tag;

    const fileKey = `${req.user.id}-${tag}-${uuidv4()}`;
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileKey,
      Expires: 60000,
      ContentType: fileType,
      ACL: "public-read",
    };

    s3.getSignedUrl("putObject", s3Params, (err, data) => {
      if (err) {
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileKey}`,
      };
      res.json({ code: 1, data: returnData });
    });
  },
};

module.exports = UserBooksController;
