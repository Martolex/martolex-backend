const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const Book = require("./Book");

class Cart extends Model {}
Cart.init(
  {
    qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    plan: { type: DataTypes.STRING(10), allowNull: false },
  },
  { sequelize: db }
);
module.exports = Cart;
