const authMutations = require("./authMutations");
const { User, userQueries } = require("./User");
const { Address, AddressQueries } = require("./Address");
const resolvers = {
  User,
  Address,
  Query: { ...userQueries, ...AddressQueries },
  Mutation: { ...authMutations },
};

module.exports = resolvers;
