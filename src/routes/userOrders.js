const router = require("express").Router();

const UserOrdersController = require("../controllers/UserOrdersController");
const validators = require("../validators/UserOrders");
router
  .route("/create")
  .post(validators.createOrder, UserOrdersController.createOrder);

router.route("/online").post(async (req, res) => {
  res.status(501).json({ code: 1, message: "not yet implemented" });
});

router.route("/").get(UserOrdersController.getUserOrders);

router
  .route("/getDeliveryAddress")
  .get(validators.getOrderAddress, UserOrdersController.getOrderAddress);

router
  .route("/:id")
  .get(validators.getOrderDetails, UserOrdersController.getOrderDetails);

router
  .route("/return/:itemId")
  .post(validators.requestItemReturn, UserOrdersController.requestItemReturn);

router
  .route("/return/:itemId/cancelRequest")
  .post(
    validators.cancelReturnRequest,
    UserOrdersController.cancelReturnRequest
  );

router
  .route("/retryPayment")
  .post(validators.retryPayment, UserOrdersController.retryPayment);

module.exports = router;
