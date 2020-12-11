const { schedule } = require("node-cron");
const { env } = require("../config/config");
const backupLogs = require("./backupLogs");

const scheduleCrons = () => {
  console.log("---scheduling crons---");
  if (env === "test" || env == "production") {
    schedule("0 0 * * *", backupLogs);
  }
};
module.exports.scheduleCrons = scheduleCrons;
