const OrdersController = require("../../controllers/sellerControllers/OrdersController");

const router = require("express").Router();

router.route("/").get(OrdersController.getOrders);

router.route("/book/:id").get(OrdersController.getOrdersByAd);

module.exports = router;
