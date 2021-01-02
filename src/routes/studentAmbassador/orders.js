const OrdersController = require("../../controllers/AmbassadorControllers/OrdersController");

const router = require("express").Router();

router.route("/leads").get(OrdersController.ordersFromLeads);

router.route("/couponCode").get(OrdersController.ordersfromCouponCode);
module.exports = router;
