const router = require("express").Router();

router.route("/").get(async (req, res) => {
  res.json({ code: 1, data: "hello" });
});

module.exports = router;
