const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
router.post("/forgot-password", AuthController.generateForgotpasswordToken);
router.post(
  "/forgot-password/verify-token",
  AuthController.verifyPasswordResetToken
);
router.post("/forgot-password/reset-password", AuthController.resetPassword);
router.post("/signUp", AuthController.signUp);
router.post("/signIn", AuthController.emailSignIn);
router.post("/googleSignIn", AuthController.googleSignIn);
router.post("/adminSignIn", AuthController.adminSignIn);
router.post("/ambassadorSignIn", AuthController.ambassadorSignIn);

module.exports = router;
