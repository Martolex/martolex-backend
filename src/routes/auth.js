const passport = require("passport");
const { User, Colleges, PasswordResetRequests } = require("../models");
const { config } = require("../config/config");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const moment = require("moment");
const router = require("express").Router();
const bCrypt = require("bcryptjs");
const AmbassadorDetails = require("../models/AmbassadorDetails");
const genPasswordResetLink = require("../utils/genPasswordResetLink");
const { InvalidTokenError } = require("../Exceptions");
const sequelize = require("../config/db");

AWS.config.update({ region: "ap-south-1" });
const Lambda = new AWS.Lambda();

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw TypeError("email");
    const user = await User.findOne({ where: { email } });
    if (user) {
      const passwordResetRequest = await PasswordResetRequests.create({
        userId: user.id,
        email: email,
      });
      const resetLink = genPasswordResetLink(passwordResetRequest.id);
      const payload = {
        type: "FORGOT_PASSWORD",
        email: email,
        link: resetLink,
      };
      const params = {
        FunctionName: "email-service",
        InvocationType: "RequestResponse",
        Payload: JSON.stringify(payload),
      };
      console.log("here");
      Lambda.invoke(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      });
      res.json({
        code: 1,
        data: { sent: true },
      });
    } else {
      res.json({ code: 0, message: "User does not exist" });
    }
  } catch (err) {
    if (err instanceof TypeError) {
      res.status(400).json({ code: 0, message: "email is not provided" });
    } else {
      res.json({ code: 0, message: "something went wrong" });
    }
  }
});
router.post("/forgot-password/verify-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) throw TypeError("token");

    const passwordResetRequest = await PasswordResetRequests.findByPk(token);
    if (!passwordResetRequest) throw new InvalidTokenError("invalid token");

    const timeElapsed = moment().diff(
      moment(passwordResetRequest.createdAt),
      "seconds"
    );
    console.log(timeElapsed);
    if (
      timeElapsed < config.resetPasswordTokenExpiry &&
      passwordResetRequest.isValid
    ) {
      res.json({ code: 1, data: { valid: true } });
    } else {
      res.json({ code: 0, message: "link Expired" });
    }
  } catch (err) {
    if (err instanceof TypeError) {
      res.status(400).json({ code: 0, message: "token is not provided" });
    } else if (err instanceof InvalidTokenError) {
      res.status(400).json({ code: 0, message: "invalid request" });
    } else {
      res.json({ code: 0, message: "something went wrong" });
    }
  }
});

router.post("/forgot-password/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) throw TypeError("no token");
    if (!password) throw TypeError("no password");
    const passwordResetRequest = await PasswordResetRequests.findByPk(token);
    if (!passwordResetRequest) throw new InvalidTokenError();

    const hashedPassword = bCrypt.hashSync(
      password,
      bCrypt.genSaltSync(8),
      null
    );
    const result = await sequelize.transaction(async (t) => {
      const userUpdatePromise = User.update(
        { password: hashedPassword },
        { where: { id: passwordResetRequest.userId }, transaction: t }
      );
      const invalidateLinkPromise = PasswordResetRequests.update(
        { isValid: false },
        { where: { id: token }, transaction: t }
      );
      return await Promise.all([userUpdatePromise, invalidateLinkPromise]);
    });

    res.json({ code: 1, data: { success: true } });
  } catch (err) {
    if (err instanceof TypeError) {
      res.status(400).json({ code: 0, message: err.message });
    } else if (err instanceof InvalidTokenError) {
      res.status(400).json({ code: 0, message: "invalid request" });
    } else {
      res.json({ code: 0, message: "something went wrong" });
    }
  }
});
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
    } else if (!bCrypt.compareSync(req.body.password, user.password)) {
      res
        .status(401)
        .json({ code: 0, auth: false, message: "incorrect password" });
    } else {
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
    }
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
            profile: {
              ...userProfile,
              college: ambassador.college,
              referralCode: ambassador.referralCode,
            },
            message: "user authenticated and authorized",
          },
        });
      }
    })
    .catch((err) => console.log(err));
});
module.exports = router;
