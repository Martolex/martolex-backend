const moment = require("moment");
const { Order, User, OrderItem, Book, UserAddress } = require("../../models");
const {
  orderStatus,
  paymentStatus,
  paymentModes,
} = require("../../utils/enums");
const {
  OrderTotal,
  validateStatus,
  createOrderFilters,
  ValidateFilters,
} = require("../../utils/orderUtils");
const getPaymentLink = require("../../utils/Payments/getPaymentLink");
const AWS = require("aws-sdk");
const Lambda = new AWS.Lambda();

const OrdersController = {
  getOrders: async (req, res) => {
    try {
      ValidateFilters(req.query);
      const filters = createOrderFilters(req.query);
      let orders = await Order.findAll({
        where: filters,
        attributes: [
          "id",
          "paymentMode",
          "paymentStatus",
          "deliveryAmount",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            required: true,
            attributes: ["name", "isAdmin"],
          },
          { model: UserAddress, as: "address", attributes: ["city"] },
          {
            model: OrderItem,
            as: "items",
            include: {
              model: Book,
              attributes: ["id"],
              as: "book",
            },
          },
        ],
      });

      orders = orders.map((order) => {
        const { items, ...orderDetails } = order.toJSON();
        return {
          ...orderDetails,
          totalAmount: OrderTotal(items) + orderDetails.deliveryAmount,
        };
      });

      res.json({ code: 1, data: orders });
    } catch (err) {
      console.log(err);
      res.json({ code: 0, message: err.message });
    }
  },

  getOrderDetails: async (req, res) => {
    let order = (
      await Order.findByPk(req.params.id, {
        attributes: [
          "id",
          "paymentMode",
          "paymentStatus",
          "orderStatus",
          "deliveryAmount",
          "createdAt",
          "deliveryMinDate",
          "deliveryMaxDate",
          "actualDeliveryDate",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email", "phoneNo"],
          },
          { model: UserAddress, as: "address" },
          {
            model: OrderItem,
            as: "items",
            include: {
              model: Book,
              attributes: ["id", "name", "author", "publisher", "isbn"],
              as: "book",
              include: [
                {
                  model: User,
                  as: "upload",
                  attributes: ["name"],
                  required: false,
                },
              ],
            },
          },
        ],
      })
    ).toJSON();

    order.totalAmount = OrderTotal(order.items) + order.deliveryAmount;
    res.json({ code: 1, data: order });
  },

  modifyOrderStatus: async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    try {
      const order = await Order.findByPk(orderId);
      if (order) {
        if (validateStatus(order, status)) {
          order.orderStatus = status;
          if (status == orderStatus.SHIPPED) {
            order.minDeliveryDate = new Date(req.body.minDate);
            order.maxDeliveryDate = new Date(req.body.maxDate);
          } else if (status == orderStatus.DELIVERED) {
            order.actualDeliveryDate = req.body.deliveryDate || new Date();
            if (order.paymentMode === paymentModes.COD) {
              order.paymentStatus = paymentStatus.PAID;
            }
          }
          await order.save();
          res.json({ code: 1, data: { success: true } });
        } else {
          res.json({ code: 0, message: "status transition invalid" });
        }
      } else {
        res.json({ code: 0, message: "order ID invalid" });
      }
    } catch (err) {
      res.json({ code: 0, message: " something went wrong" });
    }
  },
  modifyDeliveryDates: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id);
      if (order) {
        if (
          moment(req.body.deliveryMaxDate).diff(
            moment(req.body.deliveryMinDate),
            "days"
          ) > 0
        ) {
          order.deliveryMinDate = req.body.deliveryMinDate;
          order.deliveryMaxDate = req.body.deliveryMaxDate;

          await order.save();
          res.json({ code: 1, data: { success: true } });
        } else {
          res.json({
            code: 0,
            message: "min Delivery date cannot be greater than max",
          });
        }
      } else {
        res.json({ code: 0, message: "invalid orderId" });
      }
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
  resendPaymentLink: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id);
      if (order) {
        if (
          order.paymentMode == paymentModes.CASHFREE &&
          order.paymentStatus == paymentStatus.PENDING
        ) {
          try {
            const link = await getPaymentLink(order.gatewayOrderId, {
              existing: true,
            });
            res.json({ code: 1, data: { paymentLink: link } });
            const emailLambdaPayload = {
              type: "RESEND_PAYMENT_LINK",
              orderId: order.id,
              paymentLink: link,
            };
            const params = {
              FunctionName: "email-service",
              InvocationType: "RequestResponse",
              Payload: JSON.stringify(emailLambdaPayload),
            };
            Lambda.invoke(params, (err, data) => {
              if (err) {
                console.log(err);
              } else {
                console.log(data);
              }
            });
          } catch (err) {
            console.log(err);
            res.json({ code: 0, message: err });
          }
        } else {
          res.json({
            code: 0,
            message: "order not eligible for resending link",
          });
        }
      } else {
        res.json({ code: 0, message: "invalid orderId" });
      }
    } catch (err) {
      res.json({ code: 0, message: "something went wrong" });
    }
  },
};

module.exports = OrdersController;
