const { User } = require("../../models");

const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const isSeller = req.query.isSeller == "true";
    let filters = { isAdmin: false };

    if (isSeller) filters.isSeller = true;

    const users = await User.findAll({
      where: filters,
      attributes: ["id", "name", "email", "phoneNo", "isSeller"],
    });
    res.json({ code: 1, data: users });
  } catch (err) {
    res.json({ code: 0, message: "Something went wrong" });
  }
});

module.exports = router;
