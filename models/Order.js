const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const { paymentModes, paymentStatus } = require("../utils/enums");

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
    gatewayRefId: { type: DataTypes.STRING },
    gateWayMode: { type: DataTypes.STRING },
  },
  {
    sequelize: db,

    defaultScope: {},
  }
);

module.exports = Order;
