const env = process.env.NODE_ENV || "dev";
const config = {
  dev: {
    dbName: process.env.DBNAME || "martolex-new",
    dbHost: process.env.DBHOST || "localhost",
    dbUserName: process.env.DBUSER || "root",
    dbPassword: process.env.DBPASSWORD || "",
    dbPort: process.env.DBPORT || 3306,
    host: process.env.HOST || "127.0.0.1",
    port: process.env.PORT || 3000,
    jwtSecret: process.env.jwtSecret || "martolexjwttoken",
    maxSessionAge: 30 * 24 * 60 * 60 * 1000,
    sessionCleanupInterval: 15 * 60 * 1000,
  },
};
module.exports = { config: config[env], env };
