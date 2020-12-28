const ReviewsController = require("../../controllers/adminControllers/ReviewsController");

const router = require("express").Router();

router.route("/latest").get(ReviewsController.getReviews);

router.route("/delete").delete(ReviewsController.deleteReview);

module.exports = router;
