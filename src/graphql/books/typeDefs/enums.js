const { gql } = require("apollo-server");

const enums = gql`
  enum APPROVAL_STATES {
    PENDING
    APPROVED
    NOT_APPROVED
  }
`;
module.exports = enums;
