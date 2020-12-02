const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const { isValidPhone } = require("../utils/customValidators");

class SellerData extends Model {}

SellerData.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    accountNumber: { type: DataTypes.STRING(30), allowNull: false },
    accountHolderName: { type: DataTypes.STRING, allowNull: false },
    bankName: { type: DataTypes.STRING, allowNull: false },
    bankBranch: { type: DataTypes.STRING, allowNull: false },
    IFSC: { type: DataTypes.STRING(11), allowNull: false },
    line1: { type: DataTypes.STRING, allowNull: false },
    line2: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },

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
      attributes: { exclude: ["createdAt", "updatedAt", "id"] },
    },
  }
);

module.exports = SellerData;
