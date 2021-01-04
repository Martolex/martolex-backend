const { DataSource } = require("apollo-datasource");
const { Roles } = require("../authorization");
class OrdersAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }

  get isUserAdmin() {
    return this.context.user.hasRoles([Roles.ADMIN]);
  }

  get isUserCustomer() {
    return this.context.user.hasRoles([Roles.CUSTOMER]);
  }

  get isUserAmbassador() {
    return this.context.user.hasRoles([Roles.AMBASSADOR]);
  }

  get isUserSeller() {
    return this.context.user.hasRoles([Roles.SELLER]);
  }

  initialize(config) {
    this.context = config.context;
  }

  _getAdminOrders() {
    if (this.isUserAdmin) {
      return this.service.getAll();
    } else {
      throw new Error("you are not an admin");
    }
  }

  _getAmbassadorOrders() {
    console.log(this.context.user.roles);
    if (this.isUserAmbassador) {
      return this.service.getAmbassadorOrders(this.context.user.ambassadorId);
    } else {
      throw new Error("You are not an ambassador");
    }
  }

  _getSellerOrders() {
    if (this.isUserSeller) {
      return this.service.getSellerOrders({ sellerId: this.context.user.id });
    } else {
      throw new Error("You are not a seller");
    }
  }

  _getUserOrders() {}
  getAllOrders(userType) {
    switch (userType) {
      case Roles.ADMIN:
        return this._getAdminOrders();
      case Roles.AMBASSADOR:
        return this._getAmbassadorOrders();
      case Roles.SELLER:
        return this._getSellerOrders();
      case Roles.CUSTOMER:
        return this._getUserOrders();
      default:
        return new Error("invalid Argument");
    }
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
