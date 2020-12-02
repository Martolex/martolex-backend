const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class BookRent extends Model {}

BookRent.init(
  {
    oneMonth: { type: DataTypes.FLOAT },
    threeMonth: { type: DataTypes.FLOAT },
    sixMonth: { type: DataTypes.FLOAT },
    nineMonth: { type: DataTypes.FLOAT },
    twelveMonth: { type: DataTypes.FLOAT },
    sellPrice: { type: DataTypes.FLOAT, allowNull: false },
    deposit: { type: DataTypes.FLOAT, allowNull: false },
    mrp: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize: db,
    defaultScope: { attributes: { exclude: ["createdAt", "updatedAt", "id"] } },
  }
);

module.exports = BookRent;
