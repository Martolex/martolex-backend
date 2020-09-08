const { Categories, SubCategories } = require("../../models");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
  const categories = await Categories.findAll();
  res.json({ code: 1, data: categories });
});

router.route("/subCategories/:id").get(async (req, res) => {
  const subCategories = await SubCategories.findAll({
    where: { parentCategory: req.params.id },
  });
  res.json({ code: 1, data: subCategories });
});

router.get("/tree", async (req, res) => {
  try {
    const categories = await Categories.findAll({
      include: { model: SubCategories, as: "subcategories" },
    });
    res.json({ code: 1, data: { categories } });
  } catch (err) {
    res.json({ code: 0, message: "something went wrong" });
  }
});

module.exports = router;
