const router = require("express").Router();
const authRouter = require("./auth");
const userRouter = require("./user");
const sellerRouter = require("./sellerRoutes");
const adminRouter = require("./AdminRoutes/admin");
const categoriesRouter = require("./publicRoutes/categoriesRouter");
const booksRouter = require("./publicRoutes/Books");
const newsLetterRouter = require("./publicRoutes/newsletter");
const isSeller = require("../middleware/isSeller");
const isLoggedIn = require("../middleware/userLoggedIn");
const verifyRole = require("../middleware/verifyRole");
const paymentsRouter = require("./Payments");
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

router.use("/payments", paymentsRouter);

router.use("/seller", isSeller, sellerRouter);
router.use("/ambassador", isAmbassador, require("./studentAmbassador"));

module.exports = router;
