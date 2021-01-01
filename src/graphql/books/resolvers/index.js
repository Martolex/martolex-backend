const enums = require("./enums");
const { Book, BookQueries } = require("./Book");
const { Category, SubCategory } = require("./categories");
const { User } = require("./User");
const resolvers = {
  Book,
  Category,
  User,
  SubCategory,
  Query: { ...BookQueries },
  Mutation: {},
  ...enums,
};

module.exports = resolvers;
