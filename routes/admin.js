const router = require("express").Router();
const categoriesRouter = require("./categories");

router
  .route("/")
  .get(async (req, res) => {})
  .post(async (req, res) => {})
  .delete(async (req, res) => {});

router.use("/category", categoriesRouter);
module.exports = router;
