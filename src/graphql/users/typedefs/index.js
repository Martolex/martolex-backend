const { gql } = require("apollo-server");
const entities = require("./entities");
const enums = require("./enums");
const mutations = require("./authMutations");
const queries = require("./queries");

const typeDefs = gql`
  ${entities}
  ${queries}
  ${mutations}
  ${enums}
`;

module.exports = typeDefs;
