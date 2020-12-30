const { AuthenticationError } = require("apollo-server");
const AddressService = require("../../../services/AddressService");
const { userService } = require("../../../services/AuthService");
const UserService = require("../../../services/UserService");
const { accounts } = require("../data");
const User = {
  async __resolveReference(object) {
    console.log("here");
    return await UserService.findById(object.id);
  },
  async addresses({ id }) {
    return await AddressService.getUserAddresses(id);
  },
};

const userQueries = {
  async User(parent, { email }, { user: { id, isAdmin } }) {
    const user = await UserService.findUserByEmail(email);
    console.log(isAdmin);
    if (user.id !== id && !isAdmin)
      throw new AuthenticationError("access denied");
    return user;
  },

  async Users() {
    return await UserService.getAll();
  },
  async activeUser(parent, args, { user }) {
    return await userService.findById(user.id);
  },
};

module.exports = { User, userQueries };
