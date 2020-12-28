const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const authValidators = require("../validators/auth");
router.post("/forgot-password", AuthController.generateForgotpasswordToken);
router.post(
  "/forgot-password/verify-token",
  AuthController.verifyPasswordResetToken
);
router.post("/forgot-password/reset-password", AuthController.resetPassword);
router.post("/signUp", authValidators.signUp, AuthController.signUp);
router.post("/signIn", authValidators.emailSignIn, AuthController.emailSignIn);
router.post(
  "/googleSignIn",
  authValidators.emailSignIn,
  AuthController.googleSignIn
);
router.post(
  "/adminSignIn",
  authValidators.emailSignIn,
  AuthController.adminSignIn
);
router.post(
  "/ambassadorSignIn",
  authValidators.emailSignIn,
  AuthController.ambassadorSignIn
);

module.exports = router;
