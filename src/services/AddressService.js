const PermissionError = require("../Exceptions/PermissionError");
const { UserAddress } = require("../models");

class AddressService {
  constructor() {}

  async getAddressById(id, userId) {
    const address = await UserAddress.findByPk(id, {
      attributes: [...Object.keys(UserAddress.rawAttributes)],
    });
    if (address.UserId !== userId)
      throw new PermissionError("Address does not belong to user");

    return address;
  }

  async createAddress(userId, address) {
    const userAddress = await UserAddress.create({
      ...address,
      UserId: userId,
    });
    return userAddress;
  }
}

module.exports = new AddressService();
