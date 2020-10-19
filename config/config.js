const env = process.env.NODE_ENV || "dev";
const config = {
  dbName: process.env.DBNAME || "martolex-new",
  dbHost: process.env.DBHOST || "localhost",
  dbUserName: process.env.DBUSER || "root",
  dbPassword: process.env.DBPASSWORD || "",
  dbPort: process.env.DBPORT || 3306,
  host: process.env.HOST || "http://127.0.0.1:3000",
  port: process.env.PORT || 3000,
  protocol: process.env.PROTOCOL || "http://",
  jwtSecret: process.env.jwtSecret || "martolexjwttoken",
  imagesS3Bucket: process.env.IMG_S3_BUCKET || "martolex-book.images-test",
  maxSessionAge: 30 * 24 * 60 * 60 * 1000,
  sessionCleanupInterval: 15 * 60 * 1000,
  defaultLimit: 10,
  deliveryCharge: { forward: 30, return: 0 },
};
module.exports = { config: config, env };
