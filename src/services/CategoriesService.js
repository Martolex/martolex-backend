const { Categories, SubCategories } = require("../models");

class CategoriesService {
  async findCategoryById(catId) {
    return await Categories.findByPk(catId);
  }

  async findSubCatById(subCatId) {
    return await SubCategories.findByPk(subCatId);
  }

  async getSubCategories(catId) {
    return await SubCategories.findAll({ where: { parentCategory: catId } });
  }
}

module.exports = new CategoriesService();
