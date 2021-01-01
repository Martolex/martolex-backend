const { ApolloServer } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { applyMiddleware } = require("graphql-middleware");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { permissions } = require("./permissions");
const { AuthAPI, UserAPI } = require("./dataSources");
const AuthService = require("../../services/AuthService");
const UserService = require("../../services/UserService");
const AddressService = require("../../services/AddressService");
const AddressAPI = require("./dataSources/AddressAPI");
const port = 4001;

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
    authAPI: new AuthAPI({ service: AuthService }),
    userAPI: new UserAPI({ service: UserService }),
    addressAPI: new AddressAPI({ service: AddressService }),
  }),
});

server.listen({ port }).then(({ url }) => {
  console.log(`Users service ready at ${url}`);
});