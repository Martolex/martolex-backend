const { gql } = require("apollo-server");
const enums = require("./enums");
const types = require("./types");
const scalars = require("./scalars");
const queries = require("./queries");
const { authTypes } = require("../authorization");

module.exports = gql`
  ${authTypes}
  ${enums}
  ${types}
  ${scalars}
  ${queries}
`;
