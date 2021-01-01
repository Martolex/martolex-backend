const { gql } = require("apollo-server");

const entities = gql`
  extend type User @key(fields: "id") {
    id: ID! @external
    books: [Book]
  }

  type Book @key(fields: "id") {
    id: ID!
    name: String!
    author: String
    publisher: String!
    edition: String
    quantity: Int!
    isbn: String!
    description: String
    isApproved: APPROVAL_STATES!
    isBuyBackEnabled: Boolean!
    images(coverOnly: Boolean): [BookImages]
    rent: Rent
    uploader: User!
    subCategory: SubCategory
    reviews: [BookReview]
  }

  type BookImages {
    url: String!
    isDeleted: Boolean!
    isCover: Boolean!
  }

  type Rent {
    oneMonth: Float
    threeMonth: Float
    sixMonth: Float
    nineMonth: Float
    twelveMonth: Float
    sellPrice: Float!
    deposit: Float!
    mrp: Float!
  }

  type BookReview @key(fields: "id") {
    id: ID!
    review: String!
    rating: Int!
    isDeleted: Boolean!
  }

  type Category {
    name: String!
    subCategories: SubCategory
  }

  type SubCategory {
    name: String!
    category: Category
  }
`;

module.exports = entities;
