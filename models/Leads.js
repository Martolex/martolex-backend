const db = require("../config/db");
const { Model, DataTypes, Sequelize, UUIDV4, Op } = require("sequelize");
const { validate } = require("../config/db");

class Leads extends Model {}

Leads.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
      unique: true,
    },
    phoneNo: { type: DataTypes.STRING(10) },
  },
  {
    sequelize: db,
  }
);

module.exports = Leads;
