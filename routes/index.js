const router = require("express").Router();
const authRouter = require("./auth");
const userRouter = require("./user");
const adminRouter = require("./AdminRoutes/admin");
const categoriesRouter = require("./publicRoutes/categoriesRouter");
const booksRouter = require("./publicRoutes/Books");
const newsLetterRouter = require("./publicRoutes/newsletter");

const isLoggedIn = require("../middleware/userLoggedIn");
const verifyRole = require("../middleware/verifyRole");
const isAmbassador = require("../middleware/isAmbassador");
const { userRoutes: noFoundBooksUserRouter } = require("./BooksNotFound");
router
  .route("/")
  .get((req, res) => {
    res.send("martolex GET api");
  })
  .post((req, res) => {
    res.send("martolex POST api");
  });

router.use("/auth", authRouter);
router.use("/admin", verifyRole, adminRouter);
router.use("/user", isLoggedIn, userRouter);
router.use("/categories", categoriesRouter);
router.use("/books", booksRouter);
router.use("/newsletter", newsLetterRouter);
router.use("/not-found-books", noFoundBooksUserRouter);
router.use("/ambassador", isAmbassador, require("./studentAmbassador"));

//no-find-book router

module.exports = router;
