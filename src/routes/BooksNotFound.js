const BooksNotFoundController = require("../controllers/BooksNotFoundController");
const UserRouter = require("express").Router();
const adminRouter = require("express").Router();

UserRouter.post("/", BooksNotFoundController.createBookRequest);
adminRouter.get("/", BooksNotFoundController.getBookRequests);

module.exports = { userRoutes: UserRouter, adminRoutes: adminRouter };
