const { body, param } = require("express-validator");
const validate = require("../middleware/validator");
const { SubCategories } = require("../models");
const { approvalStates } = require("../utils/enums");

const rentValidators = {
  onemonthrent: body("onemonthrent").optional().isNumeric({ no_symbols: true }),
  threemonthrent: body("threemonthrent")
    .optional()
    .isNumeric({ no_symbols: true }),
  sixmonthrent: body("sixmonthrent").optional().isNumeric({ no_symbols: true }),
  ninemonthrent: body("ninemonthrent")
    .optional()
    .isNumeric({ no_symbols: true }),
  twelvemonthrent: body("twelvemonthrent")
    .optional()
    .isNumeric({ no_symbols: true }),
  sellPrice: body("sellPrice").optional().isNumeric({ no_symbols: true }),
  deposit: body("deposit").optional().isNumeric({ no_symbols: true }),
  mrp: body("mrp").optional().isNumeric({ no_symbols: true }),
};

const imageValidators = {
  frontCover: body("frontCover").exists().isURL(),
  backCover: body("backCover").exists().isURL(),
  frontPage: body("frontPage").exists().isURL(),
  otherImgs: body("otherImgs").optional().isArray({ min: 1 }),
  otherImgsUrl: body("otherImgs.*").optional().isURL(),
};

const bookValidators = {
  name: body("name").exists(),
  subCatId: body("subCatId")
    .exists()
    .isNumeric()
    .custom((value) => {
      return SubCategories.findByPk(value).then((subCat) => {
        if (!subCat) {
          return Promise.reject("Subcategory does not exist");
        }
      });
    }),
  quantity: body("quantity")
    .exists()
    .isNumeric({ no_symbols: true })
    .isFloat({ min: 1 }),
  isbn: body("isbn").optional().isISBN().withMessage("isbn invalid"),
  isDeleted: body("isDeleted").optional().isBoolean().equals(false),
  isBuyBackEnabled: body("isBuyBackEnabled").optional().isBoolean(),
  isApproved: body("isApproved").optional().equals(approvalStates.PENDING),
};

const bookIdValidator = (location) => location("bookId").exists().isUUID();

module.exports.createBook = validate([
  ...Object.values(bookValidators),
  ...Object.values(rentValidators),
  ...Object.values(imageValidators),
]);

module.exports.modifyBook = validate([
  ...Object.values(bookValidators),
  ...Object.values(rentValidators),
]);

module.exports.deleteBook = validate([bookIdValidator(body)]);

module.exports.addReview = validate([bookIdValidator(body)]);

module.exports.getBookDetails = validate([bookIdValidator(param)]);
