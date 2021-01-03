const { Colleges, AmbassadorDetails } = require("../models");
const {
  InvalidTokenError,
  UserExistsError,
  PasswordMismatchError,
  UnauthorizedError,
  TokenExpiredError,
} = require("../Exceptions/AuthExceptions");
const UserService = require("../services/AuthService");
const { LoginTypes } = require("../utils/enums");
const AuthService = require("../services/AuthService");

const AuthController = {
  generateForgotpasswordToken: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw TypeError("email");
      }
      await AuthService.createForgotPasswordRequest(email);
      res.json({
        code: 1,
        data: { sent: true },
      });
    } catch (err) {
      console.log(err);
      if (err instanceof TypeError) {
        res.status(400).json({ code: 0, message: "email is not provided" });
      } else if (err instanceof UserExistsError) {
        res.status(401).json({ code: 0, message: err.message });
      } else {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  verifyPasswordResetToken: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) throw TypeError("token");
      const isTokenValid = await AuthService.verifyPasswordResetToken(token);
      if (isTokenValid) {
        res.json({ code: 1, data: { valid: true } });
      } else {
        res.json({ code: 0, message: "link Expired" });
      }
    } catch (err) {
      console.log(err);
      if (err instanceof TypeError) {
        res.status(400).json({ code: 0, message: "token is not provided" });
      } else if (err instanceof InvalidTokenError) {
        res.status(400).json({ code: 0, message: "invalid request" });
      } else {
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token) throw TypeError("no token");
      if (!password) throw TypeError("no password");
      await AuthService.resetPassword(token, password);

      res.json({ code: 1, data: { success: true } });
    } catch (err) {
      if (err instanceof TypeError || err instanceof TokenExpiredError) {
        res.status(400).json({ code: 0, message: err.message });
      } else if (err instanceof InvalidTokenError) {
        res.status(400).json({ code: 0, message: "invalid request" });
      } else {
        console.log(err);
        res.json({ code: 0, message: "something went wrong" });
      }
    }
  },
  signUp: async (req, res) => {
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
      res.json({ code: 0, message: err.message });
    }
  },
  emailSignIn: async (req, res) => {
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
  },
  googleSignIn: async (req, res) => {
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
  },
  adminSignIn: async (req, res, next) => {
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
  },
  ambassadorSignIn: async (req, res, next) => {
    try {
      const { token, profile } = await UserService.signInByEmail(
        req.body.email,
        req.body.password,
        {
          scope: { isAmbassador: true },
          attributes: [
            "id",
            "name",
            "email",
            "phoneNo",
            "ambassadorId",
            "college",
          ],
        }
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
  },
};

module.exports = AuthController;
