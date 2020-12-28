const { body } = require("express-validator");
const validate = require("../middleware/validator");
const UserService = require("../services/UserService");

module.exports.signUp = validate([
  body("email")
    .normalizeEmail()
    .exists()
    .isEmail()
    .custom((value) => {
      return UserService.findUserByEmail(value).then((user) => {
        if (user) {
          return Promise.reject("User Exists");
        }
      });
    }),
  body("password").exists().isLength({ min: 8 }),
  body("name").exists().isAlpha(),
  body("phone").optional().isInt(),
]);

module.exports.emailSignIn = validate([
  body("email").normalizeEmail().exists().isEmail(),
  body("password").exists().withMessage("password is required"),
]);

module.exports.googleSignIn = validate([body("tokenId").exists().isJWT()]);
