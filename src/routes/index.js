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
const RequestLogger = require("../middleware/Logging");

router
  .route("/")
  .get((req, res) => {
    res.send("martolex GET api");
  })
  .post((req, res) => {
    res.send("martolex POST api");
  });

router.use("/auth", RequestLogger, authRouter);
router.use("/admin", RequestLogger, verifyRole, adminRouter);
router.use("/user", RequestLogger, isLoggedIn, userRouter);
router.use("/categories", RequestLogger, categoriesRouter);
router.use("/books", RequestLogger, booksRouter);
router.use("/newsletter", RequestLogger, newsLetterRouter);
router.use("/not-found-books", RequestLogger, noFoundBooksUserRouter);

router.use("/payments", RequestLogger, paymentsRouter);

router.use("/seller", RequestLogger, isSeller, sellerRouter);
router.use(
  "/ambassador",
  RequestLogger,
  isAmbassador,
  require("./studentAmbassador")
);
module.exports = router;
