const Express = require("express");
const App = Express();
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const index = require("./models/index");
var bodyParser = require("body-parser");

require("dotenv").config();
if (env == "dev") {
  // db.sync({ alter: true });
}

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));
App.use(IndexRouter);

App.listen(config.port, config.host, () => {
  console.log(
    `martolex server has started at http://${config.host}:${config.port}`
  );
});
