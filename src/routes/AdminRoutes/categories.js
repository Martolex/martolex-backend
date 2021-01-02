const CategoriesController = require("../../controllers/adminControllers/CategoriesController");

const router = require("express").Router();

router
  .route("/")
  .get(CategoriesController.categories.getAllCategories)
  .post(CategoriesController.categories.createCategory)
  .delete(CategoriesController.categories.deleteCategory);

router
  .route("/subCategories")
  .get(CategoriesController.subcategories.getAllSubcategories)
  .post(CategoriesController.subcategories.addSubCategory)
  .delete(CategoriesController.subcategories.deleteSubcategory);

router
  .route("/subCategories/:id")
  .get(CategoriesController.categories.getSubcategories);

router.get("/tree", CategoriesController.tree);

module.exports = router;
