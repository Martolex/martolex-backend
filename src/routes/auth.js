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
const {
  InvalidTokenError,
  UserExistsError,
  PasswordMismatchError,
  UnauthorizedError,
} = require("../Exceptions/UserExceptions");
const UserService = require("../services/UserService");
const { LoginTypes } = require("../utils/enums");
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
router.post("/signUp", async (req, res) => {
  const { email, password, phone, name } = req.body;
  try {
    const user = await UserService.signUp(email, password, {
      type: LoginTypes.EMAIL,
      profile: { name, phoneNo: phone },
    });
    res.json({
      code: 1,
      data: { message: "sign up successful. Login to continue" },
    });
  } catch (err) {
    if (err instanceof UserExistsError) {
      res.json({ code: 0, nessage: "user Exists" });
    } else {
      res.json({ code: 0, message: err.message });
    }
  }
});

router.post("/signIn", async (req, res, next) => {
  try {
    const { token, profile } = await UserService.signInByEmail(
      req.body.email,
      req.body.password
    );
    res.status(200).send({
      code: 1,
      data: {
        auth: true,
        token,
        profile,
        message: "user found & logged in",
      },
    });
  } catch (err) {
    console.log(err);
    if (
      err instanceof PasswordMismatchError ||
      err instanceof UserExistsError ||
      err instanceof UnauthorizedError
    )
      res.status(401).json({ code: 0, message: err.message });
    else
      res.json({ code: 0, message: "something went wrong. Try again later" });
  }
});
router.post("/googleSignIn", async (req, res) => {
  const { tokenId } = req.body;
  try {
    const { token, profile } = await UserService.signInByGoogle(tokenId);
    res.status(200).send({
      code: 1,
      data: {
        auth: true,
        token,
        type: LoginTypes.GOOGLE,
        profile,
        message: "user found & logged in",
      },
    });
  } catch (err) {
    console.log(err);
    if (
      err instanceof PasswordMismatchError ||
      err instanceof UserExistsError ||
      err instanceof UnauthorizedError
    )
      res.status(401).json({ code: 0, message: err.message });
    else if (err.message.includes("parse")) {
      res.status(400).json({
        code: 0,
        message: "invalid request. tokenId is not issued by this server",
      });
    } else
      res.json({ code: 0, message: "something went wrong. Try again later" });
  }
});
router.post("/adminSignIn", async (req, res, next) => {
  try {
    const { token, profile } = await UserService.signInByEmail(
      req.body.email,
      req.body.password,
      { scope: { isAdmin: true } }
    );
    res.status(200).send({
      code: 1,
      data: {
        auth: true,
        token,
        profile,
        message: "user found & logged in",
      },
    });
  } catch (err) {
    console.log(err);
    if (
      err instanceof PasswordMismatchError ||
      err instanceof UserExistsError ||
      err instanceof UnauthorizedError
    )
      res.status(401).json({ code: 0, message: err.message });
    else
      res.json({ code: 0, message: "something went wrong. Try again later" });
  }
});

router.post("/ambassadorSignIn", async (req, res, next) => {
  try {
    const { token, profile } = await UserService.signInByEmail(
      req.body.email,
      req.body.password,
      {
        scope: { isAmbassador: true },
        attributes: ["id", "name", "email", "phoneNo"],
      }
    );
    const { college } = (
      await AmbassadorDetails.findOne({
        where: { isActive: true },
        include: [
          { model: Colleges, as: "college", attributes: ["name", "id"] },
        ],
      })
    ).toJSON();
    console.log();
    res.status(200).send({
      code: 1,
      data: {
        auth: true,
        token,
        profile: { ...profile, college },
        message: "user found & logged in",
      },
    });
  } catch (err) {
    console.log(err);
    if (
      err instanceof PasswordMismatchError ||
      err instanceof UserExistsError ||
      err instanceof UnauthorizedError
    )
      res.status(401).json({ code: 0, message: err.message });
    else
      res.json({ code: 0, message: "something went wrong. Try again later" });
  }
});
module.exports = router;
