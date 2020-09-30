const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class ReturnPayments extends Model {}

ReturnPayments.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    receiverType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["BUYER", "SELLER"]] },
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentRefId: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize: db,
  }
);

module.exports = ReturnPayments;
