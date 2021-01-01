const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const { ApolloServer } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { applyMiddleware } = require("graphql-middleware");
const { permissions } = require("./permissions");
const BooksAPI = require("./dataSources/BooksAPI");
const BooksService = require("../../services/BooksService");
const CategoriesAPI = require("./dataSources/CategoriesAPI");
const CategoriesService = require("../../services/CategoriesService");
const port = 4003;

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
    books: new BooksAPI({ service: BooksService }),
    categories: new CategoriesAPI({ service: CategoriesService }),
  }),
});

server.listen({ port }).then(({ url }) => {
  console.log(`Books service ready at ${url}`);
});
