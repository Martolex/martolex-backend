const router = require("express").Router();

router.use("/leads", require("./LeadsRouter"));

module.exports = router;
