const {
  UserExistsError,
  PasswordMismatchError,
  UnauthorizedError,
  TokenExpiredError,
  InvalidTokenError,
} = require("../Exceptions/AuthExceptions");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bCrypt = require("bcryptjs");
const { LoginTypes } = require("../utils/enums");
const { config } = require("../config/config");
const sequelize = require("../config/db");
const UserService = require("./UserService");
const genPasswordResetLink = require("../utils/genPasswordResetLink");
const EmailBuilder = require("./EmailService");
const {
  PasswordResetRequests,
  AmbassadorDetails,
  Colleges,
} = require("../models");
const moment = require("moment");
const { Op } = require("sequelize");

class AuthService {
  constructor() {
    this.googleOAuthClient = new OAuth2Client(config.OAuth2Client);
    this.userService = UserService;
  }

  async signUp(email, password, { type, profile }) {
    this.userService.createUser(email, password, { type, profile });
  }

  async signInByEmail(email, password, options) {
    const user = await this.userService.findUserByEmail(email);
    return await this.signIn(user, password, options);
  }

  async signInByGoogle(token, options) {
    const googleProfile = await this._getGoogleProfile(token);
    let user = await this.userService.findUserByEmail(googleProfile.email);
    if (!user) {
      user = this.signUp(googleProfile.email, null, {
        type: LoginTypes.GOOGLE,
        profile: { phoneNo: LoginTypes.GOOGLE, name: googleProfile.name },
      });
    }
    console.log(user);
    return this.signIn(user, null, { ...options, type: LoginTypes.GOOGLE });
  }

  async createForgotPasswordRequest(email) {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      const minRequestTime = moment()
        .subtract(config.resetPasswordTokenExpiry, "seconds")
        .toDate();
      const previousValidRequests = await user.getPasswordResets({
        where: { createdAt: { [Op.gt]: minRequestTime }, isvalid: true },
        order: [["createdAt", "DESC"]],
        limit: 1,
      });
      let passwordResetRequest = null;
      if (previousValidRequests.length > 0) {
        passwordResetRequest = previousValidRequests[0];
      } else {
        passwordResetRequest = await PasswordResetRequests.create({
          userId: user.id,
          email: email,
        });
      }
      const resetLink = genPasswordResetLink(passwordResetRequest.id);
      const forgotPasswordEmail = EmailBuilder.buildForgotPasswordEmail(
        email,
        resetLink
      );
      forgotPasswordEmail.sendEmail((err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      });
      return true;
    } else {
      throw new UserExistsError("User does not exist");
    }
  }

  async verifyPasswordResetToken(token) {
    const passwordResetRequest = await PasswordResetRequests.findByPk(token);
    if (!passwordResetRequest) throw new InvalidTokenError("invalid token");

    const timeElapsed = moment().diff(
      moment(passwordResetRequest.createdAt),
      "seconds"
    );
    return timeElapsed < config.resetPasswordTokenExpiry &&
      passwordResetRequest.isValid
      ? passwordResetRequest
      : false;
  }

  async resetPassword(token, password) {
    const passwordResetRequest = await this.verifyPasswordResetToken(token);
    if (passwordResetRequest) {
      await sequelize.transaction(async () => {
        const userUpdatePromise = this.userService.resetPassword(
          passwordResetRequest.userId,
          password
        );
        const invalidateLinkPromise = PasswordResetRequests.update(
          { isValid: false },
          { where: { id: token } }
        );
        return await Promise.all([userUpdatePromise, invalidateLinkPromise]);
      });
    } else {
      throw new TokenExpiredError("Token expired");
    }
  }

  async signIn(user, password, options) {
    const { scope = {}, attributes, type = LoginTypes.EMAIL } = options || {};
    if (user) {
      let { password: hash, ...userInfo } = user.toJSON();
      const authenticated =
        type === LoginTypes.EMAIL ? this._verifyPassword(password, hash) : true;
      if (authenticated) {
        if (this._verifyScope(userInfo, scope)) {
          if (user.isAmbassador) {
            userInfo = await this._generateAmbassadorProfile(userInfo);
          }
          const profile = this._getProfile(userInfo, attributes);

          const token = this._generateToken(profile);
          return {
            token,
            profile,
          };
        } else {
          throw new UnauthorizedError(
            "User does not have the required priviledges"
          );
        }
      } else {
        throw new PasswordMismatchError("Password does not match");
      }
    } else {
      throw new UserExistsError("User does not exist");
    }
  }

  async _generateAmbassadorProfile(user) {
    const ambassador = await AmbassadorDetails.findOne({
      where: { userId: user.id },
      include: { model: Colleges, as: "college", attributes: ["name", "id"] },
    });
    return {
      ...user,
      ambassadorId: ambassador.id,
      college: ambassador.college,
    };
  }

  _verifyScope(user, scope) {
    return Object.keys(scope).every((key) => {
      return user[key] == scope[key];
    });
  }

  _verifyPassword(password, hash) {
    return bCrypt.compareSync(password, hash);
  }

  async _getGoogleProfile(tokenId) {
    const ticket = await this.googleOAuthClient.verifyIdToken({
      idToken: tokenId,
    });

    const { name, email } = ticket.getPayload();
    return { name, email };
  }

  _generateJWTPayload(user) {
    let payload = {
      id: user.id,
      type: "user",
      isAdmin: user.isAdmin,
      isAmbassador: user.isAmbassador,
    };
    if (payload.isAmbassador) {
      payload.college = user.college;
      payload.ambassadorId = user.ambassadorId;
    }
  }

  _generateToken(user) {
    const token = jwt.sign(this._generateJWTPayload(user), config.jwtSecret);

    return token;
  }

  _getProfile(user, attributes) {
    return attributes
      ? attributes.reduce((obj, key) => ({ ...obj, [key]: user[key] }), {})
      : user;
  }
}

module.exports = new AuthService();
