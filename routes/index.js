const router = require("express").Router();
const booksRouter = require("./books");
const categoriesRouter = require("./categories");
const authRouter = require("./auth");
router
  .route("/")
  .get((req, res) => {
    res.send("martolex GET api");
  })
  .post((req, res) => {
    res.send("martolex POST api");
  });

router.use("/books", booksRouter);
router.use("/category", categoriesRouter);
router.use("/auth", authRouter);

module.exports = router;
