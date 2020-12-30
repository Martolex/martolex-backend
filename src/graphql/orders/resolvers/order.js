const OrderService = require("../../../services/OrderService");

const Order = {
  async __resolveReference(object) {
    return await OrderService.findById(object.id, { flat: true });
  },
  async items({ id }) {
    return await OrderService.getorderItems(id);
  },
  customer({ userId }) {
    return { id: userId };
  },
  deliveryAddress({ addressId }) {
    console.log(addressId);
    const type = { id: addressId };
    console.log(type);
    return type;
  },
};

const orderQueries = {
  async orders(_, __, { user }) {
    return user.isAdmin
      ? await OrderService.getAll()
      : OrderService.getUserOrders(user.id, { flat: true });
  },
  async orderById(_, { id }, context) {
    return await OrderService.findById(id, { flat: true });
  },
};

module.exports = { Order, orderQueries };
