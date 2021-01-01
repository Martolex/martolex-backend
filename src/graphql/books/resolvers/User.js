const User = {
  async books({ id }, _, { dataSources: { books } }) {
    return await books.getUserBooks(id);
  },
};

module.exports = { User };
