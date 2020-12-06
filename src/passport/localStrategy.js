const passport = require("passport");
const { User } = require("../models");
const LocalStrategy = require("passport-local").Strategy;
const bCrypt = require("bcryptjs");
const SignUpStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  async (req, email, password, done) => {
    var generateHash = function (password) {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };
    const user = await User.findOne({ where: { email } });
    if (user) {
      return done(null, false, {
        message: "That email is already taken",
      });
    } else {
      var userPassword = generateHash(password);

      var data = {
        email: email,
        password: userPassword,
        name: req.body.name,
        phone: req.body.phone,
      };
      User.create(data).then(function (newUser, created) {
        if (!newUser) {
          return done(null, false);
        }
        if (newUser) {
          return done(null, newUser);
        }
      });
    }
  }
);
const LoginStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },

  function (email, password, done) {
    var isValidPassword = function (userpass, password) {
      return bCrypt.compareSync(password, userpass);
    };

    User.findOne({
      where: {
        email: email,
      },
    })
      .then(function (user) {
        if (!user) {
          return done(null, false, {
            message: "Email does not exist",
          });
        }

        if (!isValidPassword(user.password, password)) {
          return done(null, false, {
            message: "Incorrect password.",
          });
        }
        var userinfo = user.get();
        userinfo.type = "user";
        return done(null, userinfo);
      })
      .catch(function (err) {
        console.log("Error:", err);
        return done(null, false, {
          message: "Something went wrong with your Signin",
        });
      });
  }
);

module.exports = { signUp: SignUpStrategy, login: LoginStrategy };
