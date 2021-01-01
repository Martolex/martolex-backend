const { DataSource } = require("apollo-datasource");

class BooksAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }

  initialize({ context }) {
    this.context = context;
  }
  getById(id) {
    return this.service.findById(id);
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
