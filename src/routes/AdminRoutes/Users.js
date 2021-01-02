const UsersController = require("../../controllers/adminControllers/UsersController");
const router = require("express").Router();

router.get("/", UsersController.getAllUsers);

router.get("/:id/cart", UsersController.getUserCart);

router.get("/cartStats", UsersController.cartStats);

module.exports = router;
