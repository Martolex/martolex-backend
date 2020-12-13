const moment = require("moment");
const { v4: UUID } = require("uuid");
const { config, env } = require("../config/config");
const AWS = require("aws-sdk");
const fs = require("fs");
const s3 = new AWS.S3();
const backupLogs = () => {
  console.log("starting backup");
  const s3FileKey = `${UUID()}-${env}-${moment().format(
    "DD-MM-YYYY:HH:mm:ss"
  )}.txt`;

  const fileName = config.requestLogsFile;

  fs.readFile(fileName, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const params = {
        Bucket: config.reqLogsBucket,
        Key: s3FileKey,
        Body: data,
      };

      s3.upload(params, (s3Err, data) => {
        if (s3Err) console.log(s3Err);
        else {
          fs.writeFileSync(config.requestLogsFile, "");
          console.log(
            `request logs uploaded successfully at ${moment().format(
              "DD-MM-YYYY:HH:mm:ss"
            )}`
          );
        }
      });
    }
  });
};

module.exports = backupLogs;
