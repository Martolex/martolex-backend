const router = require("express").Router();
const categoriesRouter = require("./categories");
const adminBooksRouter = require("./adminBooks");

router
  .route("/")
  .get(async (req, res) => {})
  .post(async (req, res) => {})
  .delete(async (req, res) => {});

router.use("/category", categoriesRouter);
router.use("/books", adminBooksRouter);
module.exports = router;
