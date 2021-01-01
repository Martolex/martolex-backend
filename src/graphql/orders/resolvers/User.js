const User = {
  async orders({ id }, _, { dataSource }) {
    return await dataSource.orders.getUserOrders(id);
  },
};

module.exports = { User };
