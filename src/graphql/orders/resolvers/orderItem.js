const OrderService = require("../../../services/OrderService");
const { OrderItem: OrderItemDb } = require("../../../models");
const OrderItem = {
  async _resolveReference(object) {
    return await OrderItemDb.findByPk(object.id);
  },
  async order({ orderId }) {
    return await OrderService.findById(orderId, { flat: true });
  },
};

module.exports = { OrderItem };
