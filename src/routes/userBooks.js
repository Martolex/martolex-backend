const router = require("express").Router();
const UserBooksController = require("../controllers/UserBooksController");
const validators = require("../validators/UserBooks");
router
  .route("/")
  .get(UserBooksController.getUserBooks)
  .post(validators.createBook, UserBooksController.createBook)
  .put(validators.modifyBook, UserBooksController.modifyBook)
  .delete(validators.deleteBook, UserBooksController.deleteBook);
router
  .route("/review")
  .post(validators.addReview, UserBooksController.addReview);

router.route("/getBookNames").get(UserBooksController.searchBookNames);

router
  .route("/:bookId")
  .get(validators.getBookDetails, UserBooksController.getBookDetails);

router
  .route("/get_s3_signed_url")
  .post(UserBooksController.generateBookImageUploadSignedUrl);
module.exports = router;
