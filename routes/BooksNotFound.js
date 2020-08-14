const UserRouter = require("express").Router();
const adminRouter = require("express").Router();

const { NotFoundBook } = require("../models");
const buildPaginationUrls = require("../utils/buildPaginationUrls");
const { config } = require("../config/config");

UserRouter.post("/", async (req, res) => {
  try {
    await NotFoundBook.create({ ...req.body });
    res.json({
      code: 1,
      data: {
        message:
          "your request is accepted. Our team will get back to you soon.",
      },
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.json({ code: 0, message: err.errors[0].message });
    } else {
      res.json({ code: 0, message: "something went wrong" });
    }
  }
});
adminRouter.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || config.defaultLimit;
    const offset = Number(req.query.offset) || 0;
    const books = await NotFoundBook.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    res.json({
      code: 1,
      data: { books },
      pagination: buildPaginationUrls(
        req.originalUrl.split("?")[0],
        offset,
        limit,
        books.length
      ),
    });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});
module.exports = { userRoutes: UserRouter, adminRoutes: adminRouter };
