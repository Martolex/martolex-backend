const { DataSource } = require("apollo-datasource");

class CategoriesAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }

  initialize({ context }) {
    this.context = context;
  }

  getCategoryById(catId) {
    return this.service.findCategoryById(catId);
  }

  getSubCategoryById(subCatId) {
    return this.service.findSubCatById(subCatId);
  }

  getSubCategories(catId) {
    return this.service.getSubCategories(catId);
  }
}

module.exports = CategoriesAPI;
