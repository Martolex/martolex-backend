const { DataSource } = require("apollo-datasource");
const { Roles } = require("../authorization");

class AddressAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }
  initialize(config) {
    this.context = config.context;
  }

  async findById(id) {
    return await this.service.findById(id);
  }
  async getUserAddresses(userId) {
    if (
      this.context.user.id === userId ||
      this.context.user.hasRoles([Roles.ADMIN])
    )
      return await this.service.getUserAddresses(userId);
    else return null;
  }
}

module.exports = AddressAPI;
