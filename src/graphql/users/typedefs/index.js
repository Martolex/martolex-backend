const { gql } = require("apollo-server");
const entities = require("./entities");
const enums = require("./enums");
const mutations = require("./authMutations");
const queries = require("./queries");
const { authTypes } = require("../authorization");

const typeDefs = gql`
  ${entities}
  ${queries}
  ${mutations}
  ${enums}
  ${authTypes}
`;

module.exports = typeDefs;
