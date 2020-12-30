const { gql } = require("apollo-server");

const queries = gql`
  extend type Query {
    orders: [Order!]!
    orderById(id: String!): Order
  }
`;

module.exports = queries;
