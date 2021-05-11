const scalars = require("./scalars");
const enums = require("./enums");
const { Order, orderQueries } = require("./order");
const { OrderItem } = require("./orderItem");
const { User } = require("./User");
const { Book } = require("./Book");
const { Roles } = require("../authorization");
const resolvers = {
  Order,
  User,
  Roles,
  OrderItem,
  Book,
  Query: { ...orderQueries },
  ...enums,
  ...scalars,
};

module.exports = resolvers;
