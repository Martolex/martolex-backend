const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class BookRent extends Model {}

BookRent.init(
  {
    oneMonth: { type: DataTypes.FLOAT, allowNull: false },
    threeMonth: { type: DataTypes.FLOAT, allowNull: false },
    sixMonth: { type: DataTypes.FLOAT, allowNull: false },
    nineMonth: { type: DataTypes.FLOAT, allowNull: false },
    twelveMonth: { type: DataTypes.FLOAT, allowNull: false },
    deposit: { type: DataTypes.FLOAT, allowNull: false },
    mrp: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize: db }
);

module.exports = BookRent;
