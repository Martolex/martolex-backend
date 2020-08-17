const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4, Op } = require("sequelize");

class UserAddress extends Model {}

UserAddress.init(
  {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["home", "office", "hostel"]] },
    },
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
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize: db,
    indexes: [{ unique: true, fields: ["type", "UserId"] }],
    defaultScope: {
      isDeleted: false,
      attributes: { exclude: ["createdAt", "updatedAt", "UserId"] },
    },
    validate: {
      async isValidAddress() {
        const address = await UserAddress.findOne({
          where: { isDeleted: false, type: this.type, UserId: this.UserId },
        });
        if (address) {
          return new Error("address already exists");
        }
      },
    },
  }
);

module.exports = UserAddress;
