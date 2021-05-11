const Book = {
  async orders({ id: bookId }, args, { dataSources }) {
    const orders = await dataSources.orders.getOrdersByBook(bookId);
    return orders;
  },
};

module.exports = { Book };
