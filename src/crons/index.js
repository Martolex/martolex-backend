const { schedule } = require("node-cron");
const { env } = require("../config/config");
const backupLogs = require("./backupLogs");

const scheduleCrons = () => {
  console.log("---scheduling crons---");
  if (env === "test" || env == "production") {
    schedule("0 0 * * *", backupLogs);
    console.log("request log backup cron scheduled");
  }
};
module.exports.scheduleCrons = scheduleCrons;
