const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4, Op } = require("sequelize");
const { isValidPhone } = require("../utils/customValidators");

class UserAddress extends Model {}

UserAddress.init(
  {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["home", "office", "hostel"]] },
    },
    name: { type: DataTypes.STRING(50), allowNull: false },
    line1: { type: DataTypes.STRING, allowNull: false },
    line2: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    phoneNo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { isValidPhone: isValidPhone },
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        isValidZip(zip) {
          if (zip.length != 6) {
            return new Error("invalid zipCode");
          }
        },
      },
    },
  },
  {
    sequelize: db,

    defaultScope: {
      isDeleted: false,
      attributes: { exclude: ["createdAt", "updatedAt", "UserId"] },
    },
  }
);

module.exports = UserAddress;
