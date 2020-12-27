const CartController = require("../controllers/CartController");
const router = require("express").Router();
const validators = require("../validators/Cart");
router
  .route("/")
  .get(CartController.getUserCart)
  .post(validators.addToCart, CartController.addToCart)
  .delete(validators.removeFromCart, CartController.removeFromCart);

router.post("/modifyPlan", validators.modifyPlan, CartController.modifyPlan);

router.post("/modifyQty", validators.modifyQty, CartController.modifyQty);

router.route("/deliveryCharge").get(CartController.computeDeliveryCharges);

module.exports = router;
