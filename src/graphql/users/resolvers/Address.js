const Address = {
  async __resolveReference(object, { dataSources }) {
    console.log("here");
    return await dataSources.addressAPI.findById(object.id);
  },
};

const AddressQueries = {};

module.exports = { Address, AddressQueries };
