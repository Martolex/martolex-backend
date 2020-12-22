const BooksController = require("../../controllers/publicControllers/BooksController");
const router = require("express").Router();

router.route("/search").get(BooksController.searchBooks);

router.route("/cat/:catId").get(BooksController.getBooksByCategory);

router
  .route("/cat/:catId/subCat/:subCatId")
  .get(BooksController.getBooksBySubCategory);

router.route("/:bookId").get(BooksController.getBookDetails);

module.exports = router;
