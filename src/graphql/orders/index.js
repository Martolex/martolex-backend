const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { applyMiddleware } = require("graphql-middleware");
const { permissions } = require("./permissions");
const OrdersAPI = require("./DataSources/OrdersAPI");
const OrderService = require("../../services/OrderService");
const port = 4002;

const server = new ApolloServer({
  schema:
    // applyMiddleware(
    buildFederatedSchema([{ typeDefs, resolvers }]),
  // permissions
  // ),
  tracing: true,
  context: ({ req }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return { user };
  },
  dataSources: () => ({
    orders: new OrdersAPI({ service: OrderService }),
  }),
});

server.listen({ port }).then(({ url }) => {
  console.log(`Order service ready at ${url}`);
});
