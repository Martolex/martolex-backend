const db = require("../config/db");
const { Model, DataTypes } = require("sequelize");

class Categories extends Model {}
Categories.init(
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize: db,
    defaultScope: { attributes: { exclude: ["createdAt", "updatedAt"] } },
  }
);
module.exports = Categories;
