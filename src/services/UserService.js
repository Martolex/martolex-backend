const { UserExistsError } = require("../Exceptions/UserExceptions");
const { User } = require("../models");
const bCrypt = require("bcryptjs");
class UserService {
  async signUp(email, password, { type, profile }) {
    const user = await User.findOne({ where: { email } });
    if (user) {
      throw new UserExistsError("User already Exists");
    } else {
      const hashedPassword = bCrypt.hashSync(
        password,
        bCrypt.genSaltSync(8),
        null
      );
      const user = User.build({
        email,
        password: hashedPassword,
        ...profile,
      });
      return await user.save();
    }
  }
}

module.exports = new UserService();
