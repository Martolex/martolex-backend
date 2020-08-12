const { config } = require("./config");

const { Sequelize } = require("sequelize");
console.log(
  config.dbName,
  config.dbUserName,
  config.dbPassword,
  config.dbHost,
  config.dbPort
);

var sequelize = new Sequelize(
  config.dbName,
  config.dbUserName,
  config.dbPassword,
  {
    host: config.dbHost,
    port: config.dbPort,
    dialect: "mysql",
  }
);
module.exports = sequelize;
