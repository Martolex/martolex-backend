const router = require("express").Router();
const userBooksRouter = require("./userBooks");

router
  .route("/")
  .get(async (req, res) => {})
  .post(async (req, res) => {})
  .delete(async (req, res) => {});

router.use("/books", userBooksRouter);

module.exports = router;
