const router = require("express").Router();

router.use("/leads", require("./LeadsRouter"));
router.use("/colleges", require("../AdminRoutes/colleges"));

module.exports = router;
