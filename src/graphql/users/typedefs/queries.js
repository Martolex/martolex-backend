const { gql } = require("apollo-server");

const queries = gql`
  extend type Query {
    User(email: String): User

    Users: [User]
    activeUser: User!
  }
`;

module.exports = queries;
