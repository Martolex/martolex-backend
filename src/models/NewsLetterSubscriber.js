const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4, Op } = require("sequelize");

class NewsLetterSubscriber extends Model {}

NewsLetterSubscriber.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
  },
  {
    sequelize: db,
  }
);

module.exports = NewsLetterSubscriber;
