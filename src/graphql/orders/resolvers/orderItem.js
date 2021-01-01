const { Book } = require("../../../models");

const OrderItem = {
  async __resolveReference(object, _, { dataSources: { orders } }) {
    return await orders.getOrderItemById(object.id);
  },
  async order({ orderId }, _, { dataSources: { orders } }) {
    return await orders.findById(orderId);
  },
  book({ bookId, ...parent }, args) {
    return { __typename: "Book", id: bookId };
  },
};

module.exports = { OrderItem };
