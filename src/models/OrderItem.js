const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const { plans, returnStates } = require("../utils/enums");

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
    returnDate: { type: DataTypes.DATEONLY },

    isReturned: {
      type: DataTypes.INTEGER,
      validate: { isIn: [Object.values(returnStates)] },
      defaultValue: returnStates.NOT_RETURNED,
    },
    returnRequestDate: { type: DataTypes.DATEONLY },
    rent: { type: DataTypes.FLOAT },
    deposit: { type: DataTypes.FLOAT },
  },
  {
    sequelize: db,
  }
);

module.exports = OrderItem;
