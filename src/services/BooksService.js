const sequelize = require("../config/db");
const { literal, Op, where } = require("sequelize");
const { Book, BookImages, BookRent, User, BookReview } = require("../models");

class BooksService {
  get attributes() {
    return [
      ...Object.keys(Book.rawAttributes),
      [
        literal(
          `(SELECT IFNULL(AVG(rating),0) FROM BookReviews AS breviews WHERE breviews.bookId = Book.id and breviews.isDeleted = 0 )`
        ),
        "rating",
      ],
    ];
  }
  getUserBooks(userId, options) {
    const { images } = options;
  }

  getBooksRepository(isAdmin = false) {
    return isAdmin ? Book : Book.scope("available");
  }

  async findById(id) {
    const book = await Book.findByPk(id, { attributes: this.attributes });
    return book.toJSON();
  }

  async findBySubCat(subCatId, options = {}) {
    const { isAdmin = false } = options;
    const books = await this.getBooksRepository(isAdmin).findAll({
      where: { subCatId },
      attributes: this.attributes,
    });

    return books.map((book) => book.toJSON());
  }

  async findByCategory(catId, options = {}) {
    const { isAdmin = false } = options;
    catId = sequelize.escape(catId);
    const books = await this.getBooksRepository(isAdmin).findAll({
      where: {
        subCatId: [
          literal(`select id from SubCategories where parentCategory=${catId}`),
        ],
      },
      attributes: this.attributes,
    });
    return books.map((book) => book.toJSON());
  }

  async searchBooks(query, options = {}) {
    const { isAdmin = false } = options;
    query = sequelize.escape(query);
    const books = await this.getBooksRepository(isAdmin).findAll({
      attributes: [
        ...this.attributes,
        [
          literal(
            `match(Book.name,Book.author ,Book.publisher ) against (${query})`
          ),
          "relScore",
        ],
      ],
      having: { relScore: { [Op.gt]: 0 } },
      order: [literal(`relScore desc`)],
    });
    return books.map((book) => book.toJSON());
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
    return await Book.findAll({ where: { uploader: userId } });
  }

  async getReviews(bookId) {
    return await BookReview.findAll({ where: { bookId } });
  }

  async getThirdPartyBooks(approvalState) {
    return await this.getBooksRepository().findAll({
      where: { isApproved: approvalState },
      include: {
        attributes: [],
        model: User,
        as: "upload",
        where: { isAdmin: false },
        required: true,
      },
    });
  }

  async martolexSoldBooks(options = {}) {
    const { isAdmin = false } = options;
    const books = await this.getBooksRepository(isAdmin).findAll({
      attributes: this.attributes,
      include: {
        attributes: [],
        model: User,
        as: "upload",
        where: { isAdmin: true },
        required: true,
      },
    });
    return books.map((book) => book.toJSON());
  }
}

module.exports = new BooksService();
