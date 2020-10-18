const passport = require("passport");
const { User, Colleges } = require("../models");
const { config } = require("../config/config");
const jwt = require("jsonwebtoken");

const router = require("express").Router();
const bCrypt = require("bcryptjs");
const AmbassadorDetails = require("../models/AmbassadorDetails");

router.post("/signUp", (req, res) => {
  const { email, password, phone, name } = req.body;
  console.log(req.body);
  User.findOne({ where: { email } })
    .then((user) => {
      if (user) {
        res.json({ code: 0, message: "Email ID is already registered" });
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
          res.json({
            code: 1,
            data: { message: "sign up successful. Login to continue" },
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ code: 0, message: "error" });
    });
});

router.post("/signIn", async (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (!user) {
      res.status(401).json({ code: 0, auth: false, message: "user not found" });
    }
    if (!bCrypt.compareSync(req.body.password, user.password)) {
      res
        .status(401)
        .json({ code: 0, auth: false, message: "incorrect password" });
    }
    if (!user) {
      res.status(401).json({ code: 0, auth: false, message: "user not found" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        type: "user",
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
      },
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
router.post("/adminSignIn", async (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (!user || !user.isAdmin) {
      res.status(401).json({ code: 0, auth: false, message: "user not found" });
    }

    if (!bCrypt.compareSync(req.body.password, user.password)) {
      res
        .status(401)
        .json({ code: 0, auth: false, message: "incorrect password" });
    }
    if (!user) {
      res.status(401).json({ code: 0, auth: false, message: "user not found" });
    }
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
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

router.post("/ambassadorSignIn", async (req, res, next) => {
  AmbassadorDetails.findOne({
    where: { isActive: true },
    include: [
      {
        model: User,
        as: "user",
        where: {
          email: req.body.email,
        },
        attributes: ["id", "name", "email", "phoneNo", "password"],
        required: true,
      },
      { model: Colleges, as: "college", attributes: ["name", "id"] },
    ],
  })
    .then((ambassador) => {
      if (!ambassador || !ambassador.isActive) {
        res
          .status(401)
          .json({ code: 0, auth: false, message: "user not found" });
      } else if (
        !bCrypt.compareSync(req.body.password, ambassador.user.password)
      ) {
        res
          .status(401)
          .json({ code: 0, auth: false, message: "incorrect password" });
      } else {
        const token = jwt.sign(
          {
            id: ambassador.user.id,
            isAmbassador: true,
            ambassadorId: ambassador.id,
          },
          config.jwtSecret
        );
        const { password, ...userProfile } = ambassador.toJSON().user;
        res.status(200).send({
          code: 1,
          data: {
            auth: true,
            token: token,
            profile: { ...userProfile, college: ambassador.college },
            message: "user authenticated and authorized",
          },
        });
      }
    })
    .catch((err) => console.log(err));
});
module.exports = router;
