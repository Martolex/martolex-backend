const { DataSource } = require("apollo-datasource");

class AuthAPI extends DataSource {
  constructor({ service }) {
    super();
    this.service = service;
  }
  initialize(config) {
    this.context = config.context;
  }
  scopes = {
    USER: {},
    AMBASSADOR: { isAmbassador: true },
    ADMIN: { isAdmin: true },
  };
  async signIn(email, password, scope = this.scopes.USER) {
    return await this.service.signInByEmail(email, password, {
      scope,
    });
  }
}

module.exports = AuthAPI;
