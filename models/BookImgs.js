const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const UserAddress = require("./UserAddress");

class BookImages extends Model {}

BookImages.init(
  {
    url: { type: DataTypes.TEXT, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    isCover: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize: db,
    defaultScope: {
      where: { isDeleted: false },
      attributes: { exclude: ["isDeleted", "createdAt", "updatedAt", "id"] },
    },
  }
);

module.exports = BookImages;
