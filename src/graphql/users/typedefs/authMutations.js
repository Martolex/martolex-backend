const { gql } = require("apollo-server");

const mutations = gql`
  type Profile {
    id: ID!
    name: String!
    email: String!
    phoneNo: String!
    isAdmin: Boolean!
    isSeller: Boolean!
    isAmbassador: Boolean!
    sellerId: String
  }
  type loginResult {
    profile: Profile!
    token: String!
  }

  extend type Mutation {
    login(email: String!, password: String!): loginResult!
    adminLogin(email: String!, password: String!): loginResult!
    ambassadorLogin(email: String!, password: String!): loginResult!
  }
`;

module.exports = mutations;
