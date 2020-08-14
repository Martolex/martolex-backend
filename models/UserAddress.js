const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");

class UserAddress extends Model {}

UserAddress.init(
  {
    type: DataTypes.STRING,
    line1: Sequelize.STRING,
    line2: Sequelize.STRING,
    city: Sequelize.STRING,
    state: Sequelize.STRING,
    zip: Sequelize.STRING,
  },
  {
    sequelize: db,
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt", "UserId"] },
    },
  }
);

module.exports = UserAddress;
