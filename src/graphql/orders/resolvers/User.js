const OrderService = require("../../../services/OrderService");

const User = {
  async orders({ id }) {
    return await OrderService.getUserOrders(id, { flat: true });
  },
};

module.exports = { User };
