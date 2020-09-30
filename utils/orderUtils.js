const { plans, planDuration } = require("./enums");

const returnPeriod = 7 * 24 * 60 * 60 * 1000;
const getReturnDate = (plan) => {
  if (plan == plans.SELL) return null;
  else {
    const date = new Date().getTime();
    switch (plan) {
      case plans.MONTHLY:
        return date + planDuration.MONTHLY + returnPeriod;
      case plans.QUATERLY:
        return date + planDuration.QUATERLY + returnPeriod;
      case plans.SEMIANNUAL:
        return date + planDuration.SEMIANNUAL + returnPeriod;
      case plans.NINEMONTHS:
        return date + planDuration.NINEMONTHS + returnPeriod;
      case plans.ANNUAL:
        return date + planDuration.ANNUAL + returnPeriod;
    }
  }
};
const itemPrice = (item) => {
  const total =
    item.plan === plans.SELL
      ? item.book.rent[item.plan]
      : item.book.rent[item.plan] + item.book.rent.deposit;
  return total * item.qty;
};

const OrderTotal = (items) => {
  return items.reduce((total, item) => total + itemPrice(item), 0);
};

module.exports = { getReturnDate, OrderTotal, itemPrice };
