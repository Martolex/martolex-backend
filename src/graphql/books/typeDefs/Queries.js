const { gql } = require("apollo-server");

const queries = gql`
  extend type Query {
    findBookById(id: String): Book
    bookBySubCategory(subCatId: Int!): [Book]!
    bookByCategory(catId: Int!): [Book]!
    searchBooks(query: String!): [Book]!
    thirdPartyBooks(approvalState: APPROVAL_STATES!): [Book]!
      @auth(requires: [ADMIN])
    martolexSold: [Book]!
  }
`;

module.exports = queries;
