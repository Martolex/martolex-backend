// require("dotenv").config({ path: "./.env.prod" });
const Express = require("express");
const App = Express();
var session = require("express-session");
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");

const AWS = require("aws-sdk");
AWS.config.update({
  signatureVersion: "v4",
  region: "ap-south-1",
});

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

const USER_APP = process.env.ORIGIN || "http://localhost:3001";
const ADMIN_APP = process.env.ADMIN_ORIGIN || "http://localhost:4000";
const AMBASSADOR_APP = process.env.AMBASSADOR_ORIGIN || "http://localhost:5000";
const whiteListOrigins = [USER_APP, ADMIN_APP, AMBASSADOR_APP];
App.use(
  cors({
    origin: whiteListOrigins,
    credentials: true,
  })
);

const models = require("./models/index");

if (env == "dev") {
  // db.sync({ alter: true });
  // sessionStore.sync();
}

App.use(IndexRouter);
App.listen(process.env.port || config.port, () => {
  console.log("martolex server running");
});
