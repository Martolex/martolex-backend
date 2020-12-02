const db = require("../config/db");
const { Model, DataTypes, UUIDV4, Op } = require("sequelize");

class BookTags extends Model {}

BookTags.init(
  {},
  {
    sequelize: db,
    timestamps: false,
  }
);

module.exports = BookTags;
