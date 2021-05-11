const { gql } = require("apollo-server");

const scalars = gql`
  scalar Date
`;

module.exports = scalars;
