const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4 } = require("sequelize");
const BookRent = require("./BookRent");
const BookImages = require("./BookImgs");
const Cart = require("./Cart");

class Book extends Model {}

Book.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING },
    publisher: { type: DataTypes.STRING },
    edition: DataTypes.STRING,
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    isbn: { type: DataTypes.STRING(13), allowNull: false },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize: db, indexes: [{ unique: true, fields: ["isbn", "uploader"] }] }
);

module.exports = Book;
