const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class SubCategories extends Model {}
SubCategories.init(
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize: db,
    indexes: [{ type: "FULLTEXT", fields: ["name"] }],
    defaultScope: { attributes: { exclude: ["createdAt", "updatedAt"] } },
  }
);
module.exports = SubCategories;
