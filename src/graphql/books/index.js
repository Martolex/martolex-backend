const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const { ApolloServer, SchemaDirectiveVisitor } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { directives, getRoles, hasRoles } = require("./authorization");
const BooksAPI = require("./dataSources/BooksAPI");
const BooksService = require("../../services/BooksService");
const CategoriesAPI = require("./dataSources/CategoriesAPI");
const CategoriesService = require("../../services/CategoriesService");
const port = 4003;

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
    books: new BooksAPI({ service: BooksService }),
    categories: new CategoriesAPI({ service: CategoriesService }),
  }),
});

server.listen({ port }).then(({ url }) => {
  console.log(`Books service ready at ${url}`);
});
