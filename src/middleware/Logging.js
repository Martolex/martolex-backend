const fs = require("fs");
const { env } = require("../config/config");
const { config } = require("../config/config");

const getActualRequestDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9; //  convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

console.log(env);
try {
  if (!fs.existsSync(config.requestLogsFile)) {
    fs.appendFile(config.requestLogsFile, "", function (err) {
      if (err) throw err;
    });
  }
} catch (err) {
  console.log(err);
}

const Logger = (req, res, next) => {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.originalUrl;
  let status = res.statusCode;
  const start = process.hrtime();
  const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
  let log = "";
  if (env === "dev") {
    log = `[${formatted_date}] [${
      req.ip
    }] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
    console.log(log);
  } else {
    log = `${formatted_date}, ${
      req.ip
    }, ${method}, ${url}, ${status}, ${durationInMilliseconds.toLocaleString()}ms`;
    fs.appendFile(config.requestLogsFile, log + "\n", (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
  next();
};

module.exports = Logger;
