const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const { ApolloServer, SchemaDirectiveVisitor } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const OrdersAPI = require("./DataSources/OrdersAPI");
const OrderService = require("../../services/OrderService");
const { directives, getRoles } = require("./authorization");
const { hasRoles } = require("../books/authorization");
const port = 4002;
const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
SchemaDirectiveVisitor.visitSchemaDirectives(schema, directives);

const server = new ApolloServer({
  schema,
  tracing: true,
  context: ({ req }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return {
      user: { ...user, roles: getRoles(user), hasRoles: hasRoles(user) },
    };
  },
  dataSources: () => ({
    orders: new OrdersAPI({ service: OrderService }),
  }),
});

server.listen({ port }).then(({ url }) => {
  console.log(`Order service ready at ${url}`);
});
