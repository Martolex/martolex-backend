const { Book } = require("../models");

const router = require("express").Router();

router
  .route("/")
  .get(async (req, res) => {
    const books = await Book.findAll({});
    res.json({ code: 1, data: books });
  })
  .post(async (req, res) => {
    const book = Book.build(req.body);
    res.json({ code: 1, data: await book.save() });
  })
  .delete(async (req, res) => {});
module.exports = router;
