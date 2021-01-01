const { gql } = require("apollo-server");

const queries = gql`
  extend type Query {
    id: String!
    findBookById(id: String): Book
  }
`;

module.exports = queries;
