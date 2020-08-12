const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const UserAddress = require("./UserAddress");
const Cart = require("./Cart");

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.TEXT, allowNull: false },
    phoneNo: { type: DataTypes.STRING(10), allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize: db }
);

module.exports = User;
