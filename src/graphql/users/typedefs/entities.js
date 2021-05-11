const { gql } = require("apollo-server");

const entities = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    password: String! @auth(requires: [ADMIN])
    phoneNo: String! @auth(requires: [ADMIN, CUSTOMER])
    isAdmin: Boolean! @auth(requires: [ADMIN])
    isSeller: Boolean! @auth(requires: [ADMIN])
    isAmbassador: Boolean! @auth(requires: [ADMIN])
    addresses: [Address!] @auth(requires: [ADMIN, CUSTOMER])
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
