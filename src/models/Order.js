const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const { paymentModes, paymentStatus, orderStatus } = require("../utils/enums");

class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    paymentMode: {
      type: DataTypes.STRING,
      validate: { isIn: [Object.values(paymentModes)] },
    },
    paymentStatus: {
      type: DataTypes.STRING,
      isIn: [Object.values(paymentStatus)],
      defaultValue: paymentStatus.PENDING,
    },
    referralCode: {
      type: DataTypes.STRING(6),
    },
    orderStatus: {
      type: DataTypes.STRING,
      isIn: [Object.values(orderStatus)],
      defaultValue: orderStatus.PROCESSING,
    },
    gatewayOrderId: { type: DataTypes.STRING },
    gatewayRefId: { type: DataTypes.STRING },
    gateWayMode: { type: DataTypes.STRING },
    deliveryMinDate: { type: DataTypes.DATE },
    deliveryMaxDate: { type: DataTypes.DATE },
    actualDeliveryDate: { type: DataTypes.DATE },
    deliveryAmount: { type: DataTypes.FLOAT },
  },
  {
    sequelize: db,

    defaultScope: {},
  }
);

module.exports = Order;
