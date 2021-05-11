const { gql } = require("apollo-server");

const queries = gql`
  extend type Query {
    orders(userType: Role!): [Order!]! @auth(requires: [LOGGEDIN])
    orderById(id: String!): Order @auth(requires: [LOGGEDIN])

    ambassadorOrders(type: AMBASSADOR_ORDER_SOURCES): Order
      @auth(requires: [AMBASSADOR])
  }
`;

module.exports = queries;
