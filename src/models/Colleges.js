const db = require("../config/db");
const { Model, DataTypes, UUIDV4 } = require("sequelize");

class College extends Model {}
College.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowsNull: false,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    city: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize: db,
  }
);
module.exports = College;
