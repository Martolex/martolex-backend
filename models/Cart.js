const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const Book = require("./Book");
const { min } = require("./BookRent");

class Cart extends Model {}
Cart.init(
  {
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 0 },
    },
    plan: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [
          ["onemonth", "threemonth", "sixmonth", "ninemonth", "twelvemonth"],
        ],
      },
    },
  },
  {
    sequelize: db,
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt", "id"] },
    },
    indexes: [{ unique: true, fields: ["BookId", "userId"] }],
  }
);
module.exports = Cart;
