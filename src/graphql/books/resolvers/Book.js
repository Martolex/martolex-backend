const {
  searchBooks,
} = require("../../../controllers/publicControllers/BooksController");

const Book = {
  async __resolveReference({ id }, { dataSources: { books } }) {
    return await books.getById(id);
  },
  async images({ id }, { coverOnly }, { dataSources: { books } }) {
    return await books.getImages(id, { coverOnly });
  },
  async rent(book, _, { dataSources: { books } }) {
    return await books.getRent(book);
  },
  async reviews({ id }, _, { dataSources: { books } }) {
    return await books.getReviews(id);
  },
  async uploader({ uploader }, _, { user }) {
    return { id: uploader };
  },

  async subCategory({ subCatId }, _, { dataSources: { categories } }) {
    return await categories.getSubCategoryById(subCatId);
  },
};

const BookQueries = {
  async findBookById(_, { id }, { dataSources: { books } }) {
    return await books.getById(id);
  },

  async bookBySubCategory(_, { subCatId }, { dataSources: { books } }) {
    return await books.findBySubCat(subCatId);
  },
  async bookByCategory(_, { catId }, { dataSources: { books } }) {
    return await books.findByCategory(catId);
  },
  async searchBooks(_, { query }, { dataSources: { books } }) {
    return await books.searchBooks(query);
  },
  async thirdPartyBooks(_, { approvalState }, { dataSources: { books } }) {
    return await books.getThirdPartyBooks(approvalState);
  },
  async martolexSold(_, __, { dataSources: { books } }) {
    return await books.martolexSoldBooks();
  },
};

module.exports = { Book, BookQueries };
