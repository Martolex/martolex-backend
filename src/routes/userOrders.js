const router = require("express").Router();

const UserOrdersController = require("../controllers/UserOrdersController");

router.route("/create").post(UserOrdersController.createOrder);

router.route("/online").post(async (req, res) => {
  res.status(501).json({ code: 1, message: "not yet implemented" });
});

router.route("/").get(UserOrdersController.getUserOrders);

router.route("/getDeliveryAddress").get(UserOrdersController.getOrderAddress);

router.route("/:id").get(UserOrdersController.getOrderDetails);

router.route("/return/:itemId").post(UserOrdersController.requestItemReturn);

router
  .route("/return/:itemId/cancelRequest")
  .post(UserOrdersController.cancelReturnRequest);

router.route("/retryPayment").post(UserOrdersController.retryPayment);

module.exports = router;
