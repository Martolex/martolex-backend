const router = require("express").Router();
const authRouter = require("./auth");
const userRouter = require("./user");
const adminRouter = require("./admin");

const isLoggedIn = require("../middleware/userLoggedIn");
const verifyRole = require("../middleware/verifyRole");
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

module.exports = router;
