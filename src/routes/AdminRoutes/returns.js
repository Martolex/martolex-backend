const returnsController = require("../../controllers/adminControllers/ReturnsController");

const router = require("express").Router();

router.route("/requested").get(returnsController.getActiveRequests);

router.route("/processed").get(returnsController.getProcessedRequests);

router.route("/:id").get(returnsController.getReturnDetails);

router
  .route("/:id/returnPaymentDetails")
  .get(returnsController.getReturnPaymentDetails)
  .post(returnsController.processReturnPayment);

module.exports = router;
