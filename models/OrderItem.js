const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const { plans } = require("../utils/enums");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    plan: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [Object.values(plans)],
      },
    },
    qty: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize: db,

    defaultScope: {},
  }
);

module.exports = OrderItem;
