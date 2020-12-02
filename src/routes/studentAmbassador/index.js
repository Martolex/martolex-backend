const router = require("express").Router();

router.use("/leads", require("./LeadsRouter"));
router.use("/colleges", require("../AdminRoutes/colleges"));
router.use("/orders", require("./orders"));
router.use("/stats", require("./stats"));
module.exports = router;
