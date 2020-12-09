const { stat } = require("fs");
const {
  Order,
  User,
  OrderItem,
  BookRent,
  Book,
  UserAddress,
} = require("../../models");
const {
  orderStatus,
  paymentStatus,
  paymentModes,
} = require("../../utils/enums");
const { OrderTotal, validateStatus } = require("../../utils/orderUtils");

const router = require("express").Router();

router.route("/").get(async (req, res) => {
  const searchParams = {};
  if (req.query.status) {
    if (
      !Object.values(orderStatus).includes(
        String(req.query.status).toUpperCase()
      )
    ) {
      res.json({ code: 0, data: { message: "order status is invalid" } });
    } else {
      searchParams.orderStatus = req.query.status;
    }
  }
  let orders = await Order.findAll({
    where: searchParams,
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
        attributes: ["name"],
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
});

router.route("/:id").get(async (req, res) => {
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
});

router.route("/:id/modifyOrderStatus").post(async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(orderId);
    if (order) {
      if (validateStatus(order.orderStatus, status)) {
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
});

module.exports = router;
