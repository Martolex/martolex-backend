const router = require("express").Router();
const UserBooksController = require("../controllers/UserBooksController");

router
  .route("/")
  .get(UserBooksController.getUserBooks)
  .post(UserBooksController.createBook)
  .put(UserBooksController.modifyBook)
  .delete(UserBooksController.deleteBook);
router.route("/review").post(UserBooksController.addReview);

router.route("/getBookNames").get(UserBooksController.searchBookNames);

router.route("/:bookId").get(UserBooksController.getBookDetails);

router
  .route("/get_s3_signed_url")
  .post(UserBooksController.generateBookImageUploadSignedUrl);
module.exports = router;
