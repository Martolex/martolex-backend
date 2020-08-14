const router = require("express").Router();
const categoriesRouter = require("./categories");
const adminBooksRouter = require("./adminBooks");

const { adminRoutes: BooksNotFoundAdminRouter } = require("./BooksNotFound");

router;

router.use("/category", categoriesRouter);
router.use("/books", adminBooksRouter);
router.use("/not-found-books", BooksNotFoundAdminRouter);

//orders router

//no-find-router view
module.exports = router;
