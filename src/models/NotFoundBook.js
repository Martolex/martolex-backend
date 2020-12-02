const db = require("../config/db");
const { Model, DataTypes, UUIDV4 } = require("sequelize");

const { isValidISBN, isValidPhone } = require("../utils/customValidators");

class NotFoundBook extends Model {}

NotFoundBook.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    edition: { type: DataTypes.STRING },
    isbn: {
      type: DataTypes.STRING(13),
    },
    userName: DataTypes.STRING,
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    userPhone: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isValidPhone: isValidPhone,
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

module.exports = NotFoundBook;
