const router = require("express").Router();

const PaymentController = require("../controllers/PaymentsController");
router.route("/verify").post(PaymentController.verifyPaymentCallBack);

module.exports = router;
