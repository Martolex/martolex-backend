const { config, env } = require("../config/config");

module.exports = (uniqueId) => {
  const { USER_APP, TEST_USER_APP } = config.applications;
  const passwordResetLink = `${
    env === "production" ? USER_APP : TEST_USER_APP
  }/password-reset/${uniqueId}`;
  return passwordResetLink;
};
