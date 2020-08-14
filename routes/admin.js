const router = require("express").Router();
const categoriesRouter = require("./categories");
const adminBooksRouter = require("./adminBooks");

router;

router.use("/category", categoriesRouter);
router.use("/books", adminBooksRouter);

//orders router

//no-find-router view
module.exports = router;
