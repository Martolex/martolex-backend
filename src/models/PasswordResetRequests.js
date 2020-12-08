const db = require("../config/db");
const { Model, DataTypes, UUIDV4 } = require("sequelize");

class PasswordResetRequests extends Model {}
PasswordResetRequests.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowsNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    isValid: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize: db,
  }
);
module.exports = PasswordResetRequests;
