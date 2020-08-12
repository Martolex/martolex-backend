const db = require("../config/db");
const { Model, DataTypes } = require("sequelize");

class Categories extends Model {}
Categories.init(
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize: db }
);
module.exports = Categories;
