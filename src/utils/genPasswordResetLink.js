const { config } = require("../config/config");

module.exports = (uniqueId) => {
  const { USER_APP } = config.applications;
  const passwordResetLink = `${USER_APP}/password-reset/${uniqueId}`;
  return passwordResetLink;
};
