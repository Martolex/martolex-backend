const { plans } = require("../../utils/enums");

module.exports.createCartItem = (item) => {
  const itemPrice =
    item.plan == plans.SELL
      ? item.book.rent[item.plan]
      : item.book.rent.deposit;
  const itemRent = item.book.rent[item.plan];

  return {
    qty: item.qty,
    price: itemPrice,
    plan: item.plan,
    rent: itemRent,
    returnAmount: itemPrice - itemRent,
    bookId: item.BookId,
    book: {
      name: item.book.name,
      images: item.book.images,
      mrp: item.book.rent.mrp,
    },
  };
};
