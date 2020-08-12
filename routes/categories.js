const { Categories, SubCategories } = require("../models");

const router = require("express").Router();

router
  .route("/")
  .get(async (req, res) => {
    const categories = await Categories.findAll();
    res.json({ code: 1, data: categories });
  })
  .post(async (req, res) => {
    try {
      const { categoryName } = req.body;
      const category = await Categories.create({ name: categoryName });
      res.json({
        code: 1,
        data: {
          message: "category created",
          category,
        },
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "could not create category" });
    }
  })
  .delete(async (req, res) => {
    try {
      const { categoryId } = req.body;
      await Categories.destroy({ where: { id: categoryId } });
      res.json({ code: 1, message: "category deleted" });
    } catch (err) {
      res.json({ code: 0, message: "could not delete category" });
    }
  });

router
  .route("/subCategories")
  .get(async (req, res) => {
    const subCategories = await SubCategories.findAll();
    res.json({ code: 1, data: subCategories });
  })
  .post(async (req, res) => {
    try {
      const { parentCategoryId, categoryName } = req.body;
      const subCategory = await SubCategories.create({
        name: categoryName,
        parentCategory: parentCategoryId,
      });
      res.json({
        code: 1,
        data: {
          message: "sub category created",
          subCategory,
        },
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "could not create category" });
    }
  })
  .delete(async (req, res) => {
    try {
      const { categoryId } = req.body;
      await SubCategories.destroy({ where: { id: categoryId } });
      res.json({ code: 1, message: "category deleted" });
    } catch (err) {
      res.json({ code: 0, message: "could not delete category" });
    }
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
