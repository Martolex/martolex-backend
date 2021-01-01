const { gql } = require("apollo-server");
const entities = require("./entities");
const enums = require("./enums");
const queries = require("./Queries");

const typeDefs = gql`
  ${entities}
  ${queries}
  ${enums}
`;

module.exports = typeDefs;
