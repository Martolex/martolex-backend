const router = require("express").Router();
const userBooksRouter = require("./userBooks");
const cartRouter = require("./cart");
const returnsRouter = require("./returns");

const userProfileRouter = require("./userProfile");

router.use("/books", userBooksRouter);
router.use("/cart", cartRouter);
router.use("/profile", userProfileRouter);

router.use("/returns", returnsRouter);
//buy router

//orders router

module.exports = router;
