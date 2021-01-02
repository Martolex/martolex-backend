const authMutations = require("./authMutations");
const { User, userQueries } = require("./User");
const { Address, AddressQueries } = require("./Address");
const { Roles } = require("../authorization");
const resolvers = {
  User,
  Address,
  Roles,
  Query: { ...userQueries, ...AddressQueries },
  Mutation: { ...authMutations },
};

module.exports = resolvers;
