const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const UserAddress = require("./UserAddress");

class Admins extends Model {}

Admins.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.TEXT, allowNull: false },

    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize: db }
);

module.exports = Admins;
