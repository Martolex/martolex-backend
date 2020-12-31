const OrderItem = {
  async __resolveReference(object, _, { dataSources: { orders } }) {
    return await orders.getOrderItemById(object.id);
  },
  async order({ orderId }, _, { dataSources: { orders } }) {
    return await orders.findById(orderId);
  },
};

module.exports = { OrderItem };
