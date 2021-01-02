const { Categories, SubCategories } = require("../../models");
const CategoriesController = require("../../controllers/adminControllers/CategoriesController");
const router = require("express").Router();

router.route("/").get(CategoriesController.categories.getAllCategories);

router
  .route("/subCategories/:id")
  .get(CategoriesController.categories.getSubcategories);

router.get("/tree", CategoriesController.tree);

module.exports = router;
