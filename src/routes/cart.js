const CartController = require("../controllers/CartController");
const router = require("express").Router();

router
  .route("/")
  .get(CartController.getUserCart)
  .post(CartController.addToCart)
  .delete(CartController.removeFromCart);

router.post("/modifyPlan", CartController.modifyPlan);

router.post("/modifyQty", CartController.modifyQty);

router.route("/deliveryCharge").get(CartController.computeDeliveryCharges);

module.exports = router;
