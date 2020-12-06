const db = require("../config/db");
const { Model, DataTypes, UUIDV4 } = require("sequelize");
const referralCodeGenerator = require("referral-code-generator");

class AmbassadorDetails extends Model {}
AmbassadorDetails.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    startDate: { type: DataTypes.DATEONLY, defaultValue: new Date() },
    endDate: { type: DataTypes.DATEONLY },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    line1: { type: DataTypes.STRING },
    line2: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    referralCode: { type: DataTypes.STRING(6), allowNull: false },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        isValidZip(zip) {
          if (zip.length != 6) {
            return new Error("invalid zipCode");
          }
        },
      },
    },
  },
  {
    sequelize: db,
    indexes: [{ type: "UNIQUE", fields: ["userId"] }],
    hooks: {
      beforeValidate: (ambassadorDetails) => {
        ambassadorDetails.referralCode = referralCodeGenerator.alpha(
          "uppercase",
          6
        );
      },
    },
  }
);
module.exports = AmbassadorDetails;
