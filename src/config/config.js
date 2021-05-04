const env = process.env.NODE_ENV || "dev";
const TEST_USER_APP = process.env.TEST_ORIGIN || "http://localhost:3001";
const USER_APP = process.env.ORIGIN || "http://localhost:3001";
const ADMIN_APP = process.env.ADMIN_ORIGIN || "http://localhost:4000";
const AMBASSADOR_APP = process.env.AMBASSADOR_ORIGIN || "http://localhost:5000";
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
  applications: { TEST_USER_APP, USER_APP, ADMIN_APP, AMBASSADOR_APP },
  resetPasswordTokenExpiry: 30 * 60,
  requestLogsFile: "request_logs.csv",
  OAuth2Client:
    process.env.GOOGLE_AUTH_CLIENT_ID ||
    "349771876046-4ek5vlqgtjd2pjglld0d3iqsc2chc7qk.apps.googleusercontent.com",
  emailLambda: "email-service",
  reqLogsBucket: "martolex-request-logs" || process.env.REQUEST_LOGS_BUCKET,
};
module.exports = { config: config, env };
