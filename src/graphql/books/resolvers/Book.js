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
  async uploader({ uploader }) {
    return { id: uploader };
  },

  async subCategory({ subCatId }, _, { dataSources: { categories } }) {
    return await categories.getSubCategoryById(subCatId);
  },
};

const BookQueries = {
  async findBookById(parent, { id }, { dataSources: { books } }) {
    return await books.getById(id);
  },
};

module.exports = { Book, BookQueries };
