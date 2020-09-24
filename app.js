const Express = require("express");
const App = Express();
var session = require("express-session");
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({
  signatureVersion: "v4",
  region: "ap-south-1",
});

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));
App.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:3001",
    credentials: true,
  })
);

require("./models/index");
if (env == "dev") {
  // db.sync({ alter: true });
  // sessionStore.sync();
}

App.use(IndexRouter);
App.listen(process.env.port || config.port, () => {
  console.log("martolex server running");
});
