const PermissionError = require("../Exceptions/PermissionError");
const { Order, User } = require("../models");
const { returnStates } = require("../utils/enums");

class ReturnService {
  constructor() {}

  async getItemById() {
    return await OrderItem.findByPk(itemId, {
      include: {
        model: Order,
        as: "order",
        attributes: ["id"],
        include: { model: User, as: "user", attributes: ["id"] },
      },
    });
  }

  async request(userId, itemId) {
    const item = await this.getItemById(itemId);
    if (!item) throw new TypeError("item does not exist");
    if (item.order.user.id !== userId)
      throw new PermissionError("You are not authorized to return this order");

    item.isReturned = returnStates.RETURN_REQUESTED;
    item.returnRequestDate = new Date.now();
    await item.save();
  }

  async cancelRequest(userId, itemId) {
    const item = this.getItemById(itemId);
    if (!item) throw new TypeError("item does not exist");
    if (item.order.user.id !== userId)
      throw new PermissionError("You are not authorized to this order");

    const returnDate = new Date(item.returnDate);
    item.isReturned = returnStates.NOT_RETURNED;
    await item.save();
    return returnDate.getTime() > Date.now();
  }
}

module.exports = new ReturnService();
