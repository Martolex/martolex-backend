const { gql } = require("apollo-server");
const enums = require("./enums");
const types = require("./types");
const scalars = require("./scalars");
const queries = require("./queries");
module.exports = gql`
  ${enums}
  ${types}
  ${scalars}
  ${queries}
`;
