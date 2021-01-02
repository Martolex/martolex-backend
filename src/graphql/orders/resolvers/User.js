const User = {
  async orders({ id }, _, { dataSources }) {
    return await dataSources.orders.getUserOrders(id);
  },
};

module.exports = { User };
