const router = require("express").Router();

router.use("/orders", require("./orders"));

module.exports = router;
