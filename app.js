const Express = require("express");
const App = Express();
var session = require("express-session");
const sessionStore = require("./config/sessionStore")(session);
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const { UserlocalStrategy, jwtStrategy } = require("./passport");
const User = require("./models/User");
const { BookReview } = require("./models");
require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({
  signatureVersion: "v4",
  region: "ap-south-1",
});

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));
App.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:3001",
    credentials: true,
  })
);
App.use(
  session({
    store: sessionStore,
    secret: "your secret key",
    saveUninitialized: false,

    resave: false,
    cookie: { maxAge: config.maxSessionAge, sameSite: "none", secure: true },
  })
);
require("dotenv").config();

console.log(process.env.AWS_PROFILE);
require("./models/index");
if (env == "dev") {
  // db.sync({ alter: true });
  // sessionStore.sync();
}

// BookReview.bulkCreate([]);

App.use(passport.initialize());
App.use(passport.session());

passport.use("user-login-local", UserlocalStrategy.login);
passport.use("user-login-local-jwt", jwtStrategy);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findByPk(id).then(function (user) {
    if (user) {
      done(null, user.get());
    } else {
      done("error", null);
    }
  });
});

App.use(IndexRouter);
App.listen(process.env.port || config.port, () => {
  console.log("martolex server running");
});
