const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server-express");
const concurrently = require("concurrently");

var waitOn = require("wait-on");

const createGraphQlServer = async () => {
  try {
    concurrently(["concurrently -k npm:server:*"]);
    await waitOn({ resources: ["tcp:4001", "tcp:4002", "tcp:4003"] });
  } catch (err) {
    throw err;
  }
  const gateway = new ApolloGateway({
    serviceList: [
      { name: "users", url: "http://localhost:4001" },
      { name: "orders", url: "http://localhost:4002" },
      { name: "books", url: "http://localhost:4003" },
    ],
    buildService({ name, url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          request.http.headers.set(
            "user",
            context.user ? JSON.stringify(context.user) : null
          );
        },
      });
    },
  });

  const server = new ApolloServer({
    gateway,
    subscriptions: false,
    tracing: true,
    context: ({ req }) => {
      const user = req.user || null;
      return { user };
    },
  });

  return server;
};

module.exports = createGraphQlServer;
