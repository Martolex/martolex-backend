// require("dotenv").config({ path: "./.env.prod" });
// require("dotenv").config({ path: "./.env.test" });
const Express = require("express");
const App = Express();
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const models = require("./models/index");
const RequestLogger = require("./middleware/Logging");
const AWS = require("aws-sdk");
const { scheduleCrons } = require("./crons");
const createGraphQlServer = require("./graphql/createServer");
const expressJwt = require("express-jwt");
const port = process.env.port || config.port;

App.use(
  expressJwt({
    secret: config.jwtSecret,
    algorithms: ["HS256"],
    credentialsRequired: false,
  })
);

AWS.config.update({
  signatureVersion: "v4",
  region: "ap-south-1",
});

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

App.use(
  cors({
    origin: Object.values(config.applications),
    credentials: true,
  })
);

if (env == "dev") {
  // db.sync({ alter: true });
  //   .then(() => {
  //     console.log("db synced");
  //   })
  //   .catch((err) => console.log(err));
  // sessionStore.sync();
}

const initServer = async () => {
  const graphQlServer = await createGraphQlServer();
  console.log("--------------------");
  graphQlServer.applyMiddleware({ app: App });
  console.log(
    `graphql ready at ${config.host}:${config.port}${graphQlServer.graphqlPath}`
  );
  App.use(IndexRouter);
  scheduleCrons();
  App.listen(port, (req) => {
    console.log("martolex server running");
  });
};

initServer();
