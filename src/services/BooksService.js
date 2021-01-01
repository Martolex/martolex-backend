const { Book, BookImages, BookRent } = require("../models");

class BooksService {
  getUserBooks(userId, options) {
    const { images } = options;
  }

  async findById(id) {
    return await Book.findByPk(id);
  }

  async getBookImages(bookId, options) {
    const { coverOnly = false } = options;
    return await BookImages.findAll({
      where: { BookId: bookId, ...(coverOnly && { isCover: coverOnly }) },
    });
  }

  async getBookRent(rentId) {
    return await BookRent.findByPk(rentId);
  }

  async getUserBooks(userId) {
    return Book.findAll({ where: { uploader: userId } });
  }
}

module.exports = new BooksService();
