const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4, Op } = require("sequelize");

const { isValidISBN } = require("../utils/customValidators");

class Book extends Model {}

Book.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    edition: DataTypes.STRING,
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    isbn: {
      type: DataTypes.STRING(13),
      allowNull: false,
      validate: {
        isValidISBN: isValidISBN,
      },
    },
    description: { type: DataTypes.TEXT },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    isBuyBackEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize: db,

    indexes: [
      { unique: true, fields: ["isbn", "uploader"] },
      { type: "FULLTEXT", fields: ["name", "author", "publisher"] },
    ],
    scopes: {
      available: { where: { quantity: { [Op.gt]: 0 }, isApproved: true } },
    },
    defaultScope: {
      where: { isDeleted: false },
      attributes: { exclude: ["isDeleted", "createdAt", "updatedAt"] },
    },
  }
);

module.exports = Book;
