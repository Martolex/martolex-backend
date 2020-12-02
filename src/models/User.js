const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const UserAddress = require("./UserAddress");
const Cart = require("./Cart");
const { isValidPhone } = require("../utils/customValidators");

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(20), allowNull: false },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.TEXT, allowNull: false },
    phoneNo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isValidPhone: isValidPhone },
    },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isSeller: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAmbassador: { type: DataTypes.BOOLEAN, defaultValue: false },
    location: { type: DataTypes.GEOMETRY("POINT", 4326) },
  },
  {
    sequelize: db,
    defaultScope: {
      where: { isDeleted: false },
      attributes: { exclude: ["isDeleted", "createdAt", "updatedAt"] },
    },
  }
);

module.exports = User;
