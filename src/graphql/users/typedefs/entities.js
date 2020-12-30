const { gql } = require("apollo-server");

const entities = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    password: String!
    phoneNo: String!
    isAdmin: Boolean!
    isSeller: Boolean!
    isAmbassador: Boolean!
    addresses: [Address!]
  }

  type Address @key(fields: "id") {
    id: ID!
    type: ADDRESS_TYPE
    name: String!
    phoneNo: String!
    line1: String!
    line2: String!
    city: String!
    state: String!
    zip: String!
    user: User!
  }
`;

module.exports = entities;
