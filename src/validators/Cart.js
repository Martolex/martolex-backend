const { body } = require("express-validator");
const validate = require("../middleware/validator");
const { plans } = require("../utils/enums");

const validations = {
  bookId: body("bookId").exists().isUUID().withMessage("invalid bookId"),
  plan: body("plan").exists().isIn(Object.values(plans)),
  qty: body("qty")
    .exists()
    .isNumeric({ no_symbols: true })
    .isFloat({ min: 1 })
    .withMessage("invalid quantity"),
};
module.exports.addToCart = validate([
  validations.bookId,
  validations.plan,
  validations.qty,
]);

module.exports.modifyPlan = validate([validations.bookId, validations.plan]);

module.exports.modifyQty = validate([validations.bookId, validations.qty]);

module.exports.removeFromCart = validate([validations.bookId]);
