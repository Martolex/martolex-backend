// require("dotenv").config({ path: "./.env.prod" });
// require("dotenv").config({ path: "./.env.test" });
const Express = require("express");
const App = Express();
var session = require("express-session");
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const models = require("./models/index");
const RequestLogger = require("./middleware/Logging");
const AWS = require("aws-sdk");
const { scheduleCrons } = require("./crons");
AWS.config.update({
  signatureVersion: "v4",
  region: "ap-south-1",
});

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

App.use(
  cors({
    origin: Object.values(config.applications),
    credentials: true,
  })
);

scheduleCrons();

if (env == "dev") {
  // db.sync({ alter: true });
  //   .then(() => {
  //     console.log("db synced");
  //   })
  //   .catch((err) => console.log(err));
  // sessionStore.sync();
}

App.use(IndexRouter);
App.listen(process.env.port || config.port, () => {
  console.log("martolex server running");
});
