const passport = require("passport");
const { User } = require("../models");
const { config } = require("../config/config");
const jwt = require("jsonwebtoken");

const router = require("express").Router();
const bCrypt = require("bcrypt");

router.post("/signUp", (req, res) => {
  const { email, password, phone, name } = req.body;
  User.findOne({ where: { email } })
    .then((user) => {
      if (user) {
        res.json({ code: 0, message: "user already exists" });
      } else {
        const hashedPassword = bCrypt.hashSync(
          password,
          bCrypt.genSaltSync(8),
          null
        );
        const user = User.build({
          email,
          phoneNo: phone,
          name,
          password: hashedPassword,
        });
        user.save().then((data) => {
          res.json({ code: 1, message: "sign up successful" });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ code: 0, message: "error" });
    });
});

router.post("/signIn", async (req, res, next) => {
  passport.authenticate("user-login-local", function (err, user, info) {
    if (err) {
      res.status(401).json({ code: 0, message: "something went wrong" });
    } else if (info && info.message) {
      res.status(401).json({ code: 0, message: info.message });
    } else {
      req.logIn(user, (err) => {
        User.findOne({
          where: {
            email: user.email,
          },
        }).then((user) => {
          const token = jwt.sign(
            { id: user.username, type: "user" },
            config.jwtSecret
          );
          res.status(200).send({
            code: 1,
            data: {
              auth: true,
              token: token,
              profile: user,
              message: "user found & logged in",
            },
          });
        });
      });
    }
  })(req, res, next);
});

module.exports = router;
