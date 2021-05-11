const enums = require("./enums");
const { Book, BookQueries } = require("./Book");
const { Category, SubCategory } = require("./categories");
const { User } = require("./User");
const { directives: AuthDirectives, Roles } = require("../authorization");
const resolvers = {
  Book,
  Category,
  User,
  Roles,
  SubCategory,
  Query: { ...BookQueries },
  Mutation: {},
  ...enums,
};

module.exports = resolvers;
