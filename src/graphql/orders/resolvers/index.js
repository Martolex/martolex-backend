const scalars = require("./scalars");
const enums = require("./enums");
const { Order, orderQueries } = require("./order");
const { OrderItem } = require("./orderItem");
const { User } = require("./User");
const resolvers = {
  Order,
  User,
  OrderItem,
  Query: { ...orderQueries },
  ...enums,
  ...scalars,
};

module.exports = resolvers;
