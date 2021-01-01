const Category = {};

const SubCategory = {
  async category(root, _, { dataSources: { categories } }) {
    return await categories.getCategoryById(root.parentCategory);
  },
};
module.exports = { Category, SubCategory };
