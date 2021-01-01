const { gql } = require("apollo-server");
const { authTypes } = require("../authorization");
const entities = require("./entities");
const enums = require("./enums");
const queries = require("./Queries");

const typeDefs = gql`
  ${entities}
  ${queries}
  ${enums}
  ${authTypes}
`;

module.exports = typeDefs;
