var Sequelize = require("sequelize");
const { config } = require("./config");
// const connectSequelize = require("connect-session-sequelize");

var sequelize = new Sequelize(
  config.dbName,
  config.dbUserName,
  config.dbPassword,
  {
    host: config.dbHost,
    port: config.dbPort,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = (session) => {
  const SequelizeStore = require("connect-session-sequelize")(session.Store);
  return new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: config.sessionCleanupInterval,
    expiration: config.maxSessionAge,
  });
};
