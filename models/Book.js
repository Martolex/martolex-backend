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
    isbn: { type: DataTypes.STRING(13), allowNull: false, unique: true },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize: db }
);

module.exports = Book;

// const obj = {
//   id: result.book_id,
//   name: result.book_name,
//   author: result.book_author,
//   publisher: result.book_publisher,
//   edition: result.book_edition,
//   isbn: result.book_isbn,
//   code: result,
//   book_code,
//   qty: result.book_remain_qty,
//   rent: {
//     1: result.onemonthrent,
//     3: result.threemonthrent,
//     6: result.sixmonthrent,
//     9: result.ninemonthrent,
//     12: result.twelvemonthrent,
//   },
//   desc: result.book_desc,
//   coverImg: result.book_image,
//   mrp: result.book_mrp,
// };
