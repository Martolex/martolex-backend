const { DataSource } = require("apollo-datasource");
class OrdersAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }

  initialize(config) {
    this.context = config.context;
  }

  getAllOrders() {
    return this.context.user.isAdmin
      ? this.service.getAll()
      : this.service.getUserOrders(this.context.user.id);
  }

  findById(id) {
    return this.service.findById(id, { flat: true });
  }

  getOrderItems(orderId) {
    return this.service.getorderItems(orderId);
  }

  getOrderItemById(id) {
    return this.service.findOrderItemById(id);
  }

  getUserOrders(id) {
    return this.service.getUserOrders(id, { flat: true });
  }
  getOrdersByBook(bookId) {
    return this.service.getOrdersByBook(bookId);
  }
}

module.exports = OrdersAPI;
