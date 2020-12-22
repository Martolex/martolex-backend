const router = require("express").Router();
const BooksController = require("../../controllers/adminControllers/BooksController");
router
  .route("/thirdParty/approved")
  .get(BooksController.thirdParty.getApprovedBooks);
router
  .route("/thirdParty/approval")
  .post(BooksController.thirdParty.approveBook);
router
  .route("/thirdParty/pendingApproval")
  .get(BooksController.thirdParty.getBooksPendingApproval);
router
  .route("/thirdParty/notApproved")
  .get(BooksController.thirdParty.getBooksNotApproved);

router
  .route("/martolex")
  .get(BooksController.martolex.getBooks)
  .post(BooksController.martolex.addBook)
  .put(BooksController.martolex.modifyBook)
  .delete(BooksController.martolex.deleteBook);

router.route("/:bookId").get(BooksController.commons.getBookDetails);

module.exports = router;
