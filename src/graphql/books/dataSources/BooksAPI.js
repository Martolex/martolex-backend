const { DataSource } = require("apollo-datasource");
const { Roles } = require("../authorization");
const { ApolloError } = require("apollo-server");
class BooksAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }

  get isUserAdmin() {
    return this.context.user.hasRoles([Roles.ADMIN]);
  }

  initialize({ context }) {
    this.context = context;
  }
  async getById(id) {
    const book = await this.service.findById(id);
    const requiredRoles = [Roles.ADMIN];
    if (!book.isApproved && !this.isUserAdmin)
      throw new ApolloError("You can not access this book", "UNAUTHORIZED");
    return book;
  }

  findBySubCat(subCatId) {
    return this.service.findBySubCat(subCatId, { admin: this.isUserAdmin });
  }
  findByCategory(catId) {
    return this.service.findByCategory(catId, { admin: this.isUserAdmin });
  }

  searchBooks(query) {
    return this.service.searchBooks(query, { admin: this.isUserAdmin });
  }

  getThirdPartyBooks(approvalState) {
    return this.service.getThirdPartyBooks(approvalState);
  }

  getImages(id, options) {
    return this.service.getBookImages(id, options);
  }
  getRent(book) {
    return this.service.getBookRent(book.rentId);
  }
  getReviews(bookId) {
    return this.service.getReviews(bookId);
  }

  getUserBooks(userId) {
    return this.service.getUserBooks(userId);
  }

  martolexSoldBooks() {
    return this.service.martolexSoldBooks({ admin: this.isUserAdmin });
  }
}

module.exports = BooksAPI;
