const bCrypt = require("bcryptjs");
const { User } = require("../models");
const { config } = require("../config/config");
const JWTstrategy = require("passport-jwt").Strategy;
ExtractJWT = require("passport-jwt").ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
  secretOrKey: config.jwtSecret,
};

module.exports = new JWTstrategy(opts, (jwt_payload, done) => {
  try {
    // console.log(jwt_payload);
    User.findOne({
      where: {
        email: jwt_payload.id,
      },
    }).then((user) => {
      if (user) {
        console.log("user found in db in passport");
        // note the return removed with passport JWT - add this return for passport local
        user.type = "user";
        done(null, user);
      } else {
        console.log("user not found in db");
        done(null, false);
      }
    });
  } catch (err) {
    done(err);
  }
});
