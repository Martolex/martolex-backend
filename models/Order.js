const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    paymentMode: { type: DataTypes.STRING },
    paymentStatus: { type: DataTypes.STRING },
    gatewayRefId: { type: DataTypes.STRING },
    gateWayMode: { type: DataTypes.STRING },
  },
  {
    sequelize: db,

    defaultScope: {},
  }
);

module.exports = Order;
