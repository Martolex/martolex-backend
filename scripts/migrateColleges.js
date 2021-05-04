require("dotenv").config({ path: "../.env.prod" });
const db = require("../src/config/db");
const { Colleges } = require("../src/models");
const colleges = require("./colleges");
db.authenticate()
  .then(() => "Connection has been established successfully.")
  .catch((err) => console.log(err));
// db.sync({ alter: true });

Colleges.bulkCreate(colleges)
  .then(() => console.log("done"))
  .catch((err) => {
    console.log(err);
  });
