const { ApolloServer } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");
const { applyMiddleware } = require("graphql-middleware");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
console.log(resolvers);
const { permissions } = require("./permissions");
const port = 4001;
const logInput = () => {
  let level = 0;
  return async (resolve, root, args, context, info) => {
    level++;
    console.log(`1. logInputRoot: ${JSON.stringify(root)}`);
    console.log(`1. logInputargs: ${JSON.stringify(args)}`);
    const result = await resolve(root, args, context, info);
    console.log(`level-${level}`, result);
    return result;
  };
};

const server = new ApolloServer({
  schema: applyMiddleware(
    buildFederatedSchema([{ typeDefs, resolvers }]),
    logInput()
  ),
  tracing: true,
  context: ({ req }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return { user };
  },
});

server.listen({ port }).then(({ url }) => {
  console.log(`Users service ready at ${url}`);
});
