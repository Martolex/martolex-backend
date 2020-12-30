const { accounts } = require("../data");
const jwt = require("jsonwebtoken");
const { config } = require("../../../config/config");
const AuthService = require("../../../services/AuthService");
const mutations = {
  async login(parent, { email, password }) {
    const { profile, token } = await AuthService.signInByEmail(email, password);
    return { token, profile };
  },
  async adminLogin(parent, { email, password }) {
    const { profile, token } = await AuthService.signInByEmail(
      email,
      password,
      { scope: { isAdmin: true } }
    );
    return { token, profile };
  },
  async ambassadorLogin(parent, { email, password }) {
    const { profile, token } = await AuthService.signInByEmail(
      email,
      password,
      { scope: { isAmbassador: true } }
    );
    return { token, profile };
  },
};

module.exports = mutations;
