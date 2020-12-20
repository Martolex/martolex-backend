const {
  UserExistsError,
  PasswordMismatchError,
  UnauthorizedError,
} = require("../Exceptions/UserExceptions");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");
const bCrypt = require("bcryptjs");
const { LoginTypes } = require("../utils/enums");
const { config } = require("../config/config");
class UserService {
  constructor() {
    this.googleOAuthClient = new OAuth2Client(config.OAuth2Client);
  }
  async signUp(email, password, { type, profile }) {
    const user = await User.findOne({ where: { email } });
    if (user) {
      throw new UserExistsError("User already Exists");
    } else {
      const hashedPassword =
        type === LoginTypes.EMAIL
          ? bCrypt.hashSync(password, bCrypt.genSaltSync(8), null)
          : type;
      const user = User.build({
        email,
        password: hashedPassword,
        ...profile,
      });
      return await user.save();
    }
  }

  _generateToken(user) {
    const token = jwt.sign(
      {
        id: user.id,
        type: "user",
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
      },
      config.jwtSecret
    );

    return token;
  }

  _getProfile(user, attributes) {
    return attributes
      ? attributes.reduce((obj, key) => ({ ...obj, [key]: user[key] }), {})
      : user;
  }

  async signIn(user, password, options) {
    const { scope = {}, attributes, type = LoginTypes.EMAIL } = options || {};
    if (user) {
      const { password: hash, ...profile } = user.toJSON();
      const authenticated =
        type === LoginTypes.EMAIL ? this._verifyPassword(password, hash) : true;
      if (authenticated) {
        if (this._verifyScope(profile, scope)) {
          return {
            token: this._generateToken(profile),
            profile: this._getProfile(profile, attributes),
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

  async signInByEmail(email, password, options) {
    const user = await this.findUser(email);
    return await this.signIn(user, password, options);
  }

  async signInByGoogle(token, options) {
    const googleProfile = await this.getGoogleProfile(token);
    let user = await this.findUser(googleProfile.email);
    if (!user) {
      user = this.signUp(googleProfile.email, null, {
        type: LoginTypes.GOOGLE,
        profile: { phoneNo: LoginTypes.GOOGLE, name: googleProfile.name },
      });
    }
    console.log(user);
    return this.signIn(user, null, { ...options, type: LoginTypes.GOOGLE });
  }

  _verifyScope(user, scope) {
    return Object.keys(scope).every((key) => {
      return user[key] == scope[key];
    });
  }

  _verifyPassword(password, hash) {
    return bCrypt.compareSync(password, hash);
  }

  async getGoogleProfile(tokenId) {
    const ticket = await this.googleOAuthClient.verifyIdToken({
      idToken: tokenId,
    });

    const { name, email } = ticket.getPayload();
    return { name, email };
  }

  async findUser(email) {
    const user = await User.findOne({ where: { email } });
    return user;
  }
}

module.exports = new UserService();
