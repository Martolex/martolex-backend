const { config, env } = require("./config");
const { Sequelize } = require("sequelize");
const cls = require("cls-hooked");

const transactionNamespace = cls.createNamespace("transactions");
Sequelize.useCLS(transactionNamespace);

var sequelize = new Sequelize(
  config.dbName,
  config.dbUserName,
  config.dbPassword,
  {
    host: config.dbHost,
    port: config.dbPort,
    dialect: "mysql",

    dialectOptions:
      env === "test" || env === "production"
        ? {
            ssl: "Amazon RDS",
          }
        : {},
    logging: false,
  }
);

module.exports = sequelize;
