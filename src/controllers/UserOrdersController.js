const AddressService = require("../services/AddressService");
const OrderService = require("../services/OrderService");
const UserService = require("../services/UserService");
const ReturnsService = require("../services/ReturnsService");
const PermissionError = require("../Exceptions/PermissionError");
const getPaymentLink = require("../utils/Payments/getPaymentLink");
const { paymentStatus } = require("../utils/enums");

const UserOrdersController = {
  createOrder: async (req, res) => {
    try {
      const addressPromise = req.body.addressId
        ? AddressService.getAddressById(req.body.addressId, req.user.id)
        : AddressService.createAddress(req.user.id, req.body.address);

      const userPromise = UserService.findById(req.user.id, {
        attributes: ["email", "id"],
      });
      const [address, user] = await Promise.all([addressPromise, userPromise]);

      const { orderIds, paymentLink } = await OrderService.createOrder(
        req.body.items,
        user,
        address
      );
      res.json({ code: 1, data: { orderIds, paymentLink } });
    } catch (err) {
      if (err instanceof PermissionError) {
        res.json({ code: 0, message: err.message });
      } else {
        res.json({
          code: 0,
          message: "Your request could not be completed at the moment",
        });
      }
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const orders = await OrderService.getUserOrders(req.user.id);
      res.json({
        code: 1,
        data: orders,
      });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  getOrderAddress: async (req, res) => {
    try {
      const address = await OrderService.getOrderAddress(
        req.query.orderId,
        req.user.id
      );
      res.json({ code: 1, data: address });
    } catch (err) {
      console.log(err);
      if (err instanceof TypeError || err instanceof PermissionError) {
        res.json({ code: 0, message: err.message });
      }
      res.json({ code: 0, message: " something went wrong" });
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await OrderService.findById(id);
      if (order.userId !== req.user.id)
        throw new PermissionError("user cannot access this order");
      res.json({ code: 1, data: order });
    } catch (err) {
      if (err instanceof PermissionError) {
        res.json({ code: 0, message: err.message });
      }
      res.json({ code: 0, message: "something went wrong" });
    }
  },

  requestItemReturn: async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;
    try {
      await ReturnsService.request(userId, itemId);
      res.json({
        code: 1,
        data: { message: "Return request submitted successfully" },
      });
    } catch (err) {
      if (err instanceof TypeError || err instanceof PermissionError)
        res.json({ code: 0, message: err.message });
      else res.json({ code: 0, message: "something went wrong" });
    }
  },
  cancelReturnRequest: async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;
    try {
      const cancellableInFuture = await ReturnsService.cancelRequest(
        userId,
        itemId
      );
      const message = cancellableInFuture
        ? "request cancelled"
        : "Return request cancelled. You cannot return your book now as the return period had expired";

      res.json({ code: 1, data: { message } });
    } catch (err) {
      if (err instanceof TypeError || err instanceof PermissionError)
        res.json({ code: 0, message: err.message });
      else res.json({ code: 0, message: "something went wrong" });
    }
  },
  retryPayment: async (req, res) => {
    const { orderId } = req.body;
    try {
      const order = await OrderService.findById(orderId, { flat: true });
      if (!order) throw new TypeError("order Does not exist");
      if (order.paymentStatus !== paymentStatus.PAID) {
        const paymentLink = await getPaymentLink(order.gatewayOrderId, {
          existing: true,
        });
        res.json({ code: 1, data: { paymentLink } });
      } else {
        res.json({ code: 0, message: "Payment already done" });
      }
    } catch (err) {
      console.log(err);
      if (err instanceof TypeError || err instanceof PermissionError)
        res.json({ code: 0, message: err.message });
      else res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = UserOrdersController;
