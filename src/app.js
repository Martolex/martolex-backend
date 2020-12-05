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

App.use(
  cors({
    origin: Object.values(config.applications),
    credentials: true,
  })
);

const models = require("./models/index");

// models.Colleges.bulkCreate([
//   { name: "KJ SOMAIYA", city: "MUMBAI" },
//   { name: "COEP", city: "PUNE" },
// ]).then(() => {
//   console.log("created");
// });
//
if (env == "dev") {
  db.sync({ alter: true });
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
