const { Op } = require("sequelize");
const { Colleges } = require("../../models");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
  const { query } = req.query;
  try {
    const colleges = await Colleges.findAll({
      where: { name: { [Op.like]: `%${query}%` } },
    });
    res.json({
      code: 1,
      data: colleges,
    });
  } catch (err) {
    console.log(err);
    res.json({ code: 0, message: "something went wrong" });
  }
});

module.exports = router;
