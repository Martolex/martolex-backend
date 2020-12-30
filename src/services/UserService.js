const { User } = require("../models");
const { LoginTypes } = require("../utils/enums");
const bCrypt = require("bcryptjs");

class UserService {
  async findUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    return user;
  }

  async getAll() {
    return await User.findAll({});
  }
  async findById(id, options = {}) {
    const { attributes = Object.keys(User.rawAttributes) } = options;
    return await User.findByPk(id, { attributes });
  }

  async createUser(email, password, { type = LoginTypes.EMAIL, profile }) {
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

  async resetPassword(userId, password) {
    const hashedPassword = bCrypt.hashSync(
      password,
      bCrypt.genSaltSync(8),
      null
    );
    await User.update({ password: hashedPassword }, { where: { id: userId } });
  }
}

module.exports = new UserService();
