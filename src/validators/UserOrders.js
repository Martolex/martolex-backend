const { body, query, param } = require("express-validator");
const validate = require("../middleware/validator");
const { plans } = require("../utils/enums");

const addressValidator = (props) =>
  props.map((prop) =>
    body(`address.${prop}`)
      .if((_, { req }) => req.body[prop])
      .exists()
      .notEmpty()
  );

const itemValidators = [
  body("items").exists().isArray({ min: 1 }),
  body("items.*.qty")
    .exists()
    .isNumeric({ no_symbols: true })
    .isFloat({ min: 1 }),
  body("items.*.plan").exists().isIn(Object.values(plans)),
  body("items.*.bookId").exists().isUUID(),
  body("items.*.rent").exists().isFloat(),
  body("items.*.deposit").exists().isFloat(),
];

module.exports.createOrder = validate([
  body().custom(
    (body) =>
      new Promise((resolve, reject) => {
        if (!body.addressId && !body.address) {
          reject("address is not provided");
        }
        resolve();
      })
  ),
  ...addressValidator([
    "name",
    "city",
    "line1",
    "line2",
    "zip",
    "phoneNo",
    "state",
    "type",
  ]),
  body("referralCode").optional().isAlphanumeric().isLength({ min: 6, max: 6 }),
  ...itemValidators,
]);

module.exports.getOrderAddress = validate([query("orderId").exists().isUUID()]);
module.exports.getOrderDetails = validate([]);
module.exports.retryPayment = validate([]);
module.exports.requestItemReturn = validate([]);
module.exports.cancelReturnRequest = validate([]);
