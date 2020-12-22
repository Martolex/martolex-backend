const statsController = require("../../controllers/AmbassadorControllers/StatsController");

const router = require("express").Router();
router.route("/").get(statsController.getStats);

module.exports = router;
