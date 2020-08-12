const Express = require("express");
const App = Express();
var session = require("express-session");
var FileStore = require("session-file-store")(session);
const { config, env } = require("./config/config");
const IndexRouter = require("./routes/index");
const db = require("./config/db");
const index = require("./models/index");
const bodyParser = require("body-parser");
const passport = require("passport");
const { UserlocalStrategy, jwtStrategy } = require("./passport");
const User = require("./models/User");

require("dotenv").config();
if (env == "dev") {
  //   db.sync({ force: true });
}

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

App.use(
  session({
    store: new FileStore({}),
    secret: "your secret key",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: config.maxSessionAge },
  })
);

App.use(passport.initialize());
App.use(passport.session());

passport.use("user-login-local", UserlocalStrategy.login);
passport.use("user-login-local-jwt", jwtStrategy);

passport.serializeUser(function (user, done) {
  //   console.log(user);
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
App.listen(config.port, config.host, () => {
  console.log(
    `martolex server has started at http://${config.host}:${config.port}`
  );
});
