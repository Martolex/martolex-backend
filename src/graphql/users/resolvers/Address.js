const AddressService = require("../../../services/AddressService");

const Address = {
  async __resolveReference(object) {
    console.log("here");
    return await AddressService.findById(object.id);
  },
};

const AddressQueries = {};

module.exports = { Address, AddressQueries };
