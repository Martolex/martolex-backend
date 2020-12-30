const { DataSource } = require("apollo-datasource");

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
    return await this.service.getUserAddresses(userId);
  }
}

module.exports = AddressAPI;
