const db = require("../config/db");
const { Model, DataTypes, UUIDV4, Op } = require("sequelize");

class Tags extends Model {}

Tags.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    tag: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize: db,
  }
);

module.exports = Tags;
