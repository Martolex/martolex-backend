const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    plan: { type: DataTypes.STRING },
    qty: { type: DataTypes.STRING },
  },
  {
    sequelize: db,

    defaultScope: {},
  }
);

module.exports = OrderItem;
