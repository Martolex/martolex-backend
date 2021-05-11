const { gql } = require("apollo-server");

const types = gql`
  type Order @key(fields: "id") {
    id: ID!
    paymentMode: PAYMENT_MODES!
    paymentStatus: PAYMENT_STATUS!
    referralCode: String
    orderStatus: ORDER_STATUS!
    gatewayOrderId: String! @auth(requires: [ADMIN])
    gatewayRefId: String @auth(requires: [ADMIN])
    gateWayMode: String @auth(requires: [ADMIN])
    deliveryMinDate: Date!
    deliveryMaxDate: Date!
    actualDeliveryDate: Date!
    deliveryAmount: Date!
    items: [OrderItem]!
    createdAt: Date!
    customer: User!
    deliveryAddress: Address
  }

  extend type Book @key(fields: "id") {
    id: ID! @external
    orders: [Order]! @auth(requires: [LOGGEDIN])
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    orders: [Order]! @auth(requires: [LOGGEDIN])
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
    book: Book!
    order: Order!
  }
`;

module.exports = types;
