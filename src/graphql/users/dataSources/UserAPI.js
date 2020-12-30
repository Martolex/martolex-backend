const { DataSource } = require("apollo-datasource");

class UserAPI extends DataSource {
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

  async findByEmail(email) {
    return await this.service.findUserByEmail(email);
  }

  async getAll() {
    return await this.service.getAll();
  }
}

module.exports = UserAPI;
