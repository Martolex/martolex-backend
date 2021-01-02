const OrdersController = require("../../controllers/adminControllers/OrdersController");

const router = require("express").Router();

router.route("/").get(OrdersController.getOrders);

router.route("/:id").get(OrdersController.getOrderDetails);

router.route("/:id/modifyOrderStatus").post(OrdersController.modifyOrderStatus);

router
  .route("/:id/modifyDeliveryDates")
  .post(OrdersController.modifyDeliveryDates);
router.route("/:id/resendPaymentLink").post(OrdersController.resendPaymentLink);

module.exports = router;
