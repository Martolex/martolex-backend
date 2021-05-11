const { AuthenticationError } = require("apollo-server");
const { Roles } = require("../authorization");

const User = {
  async __resolveReference(object, { dataSources, user }) {
    return await dataSources.userAPI.findById(object.id);
  },
  async addresses({ id }, args, { dataSources: { addressAPI } }) {
    return await addressAPI.getUserAddresses(id);
  },
};

const userQueries = {
  async User(parent, { email }, { user: accessor, dataSources }) {
    const user = await dataSources.userAPI.findByEmail(email);
    if (!user) return null;
    if (user.id !== accessor.id && accessor.isAdmin)
      throw new AuthenticationError("access denied");
    return user;
  },

  async Users(parent, args, { dataSources }) {
    return await dataSources.userAPI.getAll();
  },
  async activeUser(parent, args, { user, dataSources }) {
    return await dataSources.userAPI.findById(user.id);
  },
};

module.exports = { User, userQueries };
