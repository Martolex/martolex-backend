const { DataSource } = require("apollo-datasource");
const { Roles } = require("../authorization");
const { ApolloError } = require("apollo-server");
class BooksAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }

  initialize({ context }) {
    this.context = context;
  }
  async getById(id) {
    const book = await this.service.findById(id);
    const requiredRoles = [Roles.ADMIN];
    const isApproved = book.approval();
    if (!isApproved && !this.context.user.hasRoles(requiredRoles))
      throw new ApolloError("You can not access this book", "UNAUTHORIZED");
    return book;
  }
  getImages(id, options) {
    return this.service.getBookImages(id, options);
  }
  getRent(book) {
    return this.service.getBookRent(book.rentId);
  }

  getUserBooks(userId) {
    return this.service.getUserBooks(userId);
  }
}

module.exports = BooksAPI;
