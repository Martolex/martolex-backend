const { gql } = require("apollo-server");

const types = gql`
  type Order @key(fields: "id") {
    id: ID!
    paymentMode: PAYMENT_MODES!
    paymentStatus: PAYMENT_STATUS!
    referralCode: String
    orderStatus: ORDER_STATUS!
    gatewayOrderId: String!
    gatewayRefId: String
    gateWayMode: String
    deliveryMinDate: Date!
    deliveryMaxDate: Date!
    actualDeliveryDate: Date!
    deliveryAmount: Date!
    items: [OrderItem]!
    createdAt: Date!
    customer: User!
    deliveryAddress: Address
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    orders: [Order]!
  }

  extend type Address @key(fields: "id") {
    id: ID! @external
  }

  type OrderItem @key(fields: "id") {
    id: ID!
    plan: PLANS!
    qty: Int!
    returnDate: Date
    isReturned: RETURN_STATES!
    returnRequestDate: Date
    rent: Float
    deposit: Float
    bookId: String!
    order: Order!
  }
`;

module.exports = types;
