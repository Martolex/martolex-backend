const Order = {
  async __resolveReference(object, _, { dataSources: { orders } }) {
    return await orders.findById(object.id, { flat: true });
  },
  async items({ id }, _, { dataSources: { orders }, ...context }, info) {
    return await orders.getOrderItems(id);
  },
  customer({ userId }) {
    return { id: userId };
  },
  deliveryAddress({ addressId }) {
    return { id: addressId };
  },
};

const orderQueries = {
  async orders(_, { userType }, { dataSources: { orders } }) {
    return await orders.getAllOrders(userType);
  },
  async orderById(_, { id }, { dataSources: { orders } }) {
    return await orders.findById(id, { flat: true });
  },
};

module.exports = { Order, orderQueries };
