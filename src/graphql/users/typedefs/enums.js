const { gql } = require("apollo-server");

const enums = gql`
  enum ADDRESS_TYPE {
    home
    office
    hostel
  }
`;

module.exports = enums;
