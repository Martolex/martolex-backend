const router = require("express").Router();
const categoriesRouter = require("./categories");
const adminBooksRouter = require("./adminBooks");
const adminOrdersRouter = require("./Orders");
const returnsRouter = require("./returns");
const newsletterRouter = require("./newsletter");
const { adminRoutes: BooksNotFoundAdminRouter } = require("../BooksNotFound");

router;

router.use("/category", categoriesRouter);
router.use("/books", adminBooksRouter);
router.use("/orders", adminOrdersRouter);
router.use("/not-found-books", BooksNotFoundAdminRouter);
router.use("/returns", returnsRouter);
router.use("/newsletter", newsletterRouter);

//orders router

//no-find-router view
module.exports = router;
