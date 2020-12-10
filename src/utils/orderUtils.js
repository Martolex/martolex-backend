const {
  plans,
  planDuration,
  orderStatus,
  paymentModes,
  paymentStatus,
} = require("./enums");

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
      : item.book.rent.deposit;
  return total * item.qty;
};

const OrderTotal = (items) => {
  return items.reduce((total, item) => total + item.qty * item.deposit, 0);
};

const validateStatus = (order, newStatus) => {
  if (
    order.paymentMode === paymentModes.CASHFREE &&
    order.paymentStatus !== paymentStatus.PAID
  )
    return false;
  if (!Object.values(orderStatus).includes(newStatus)) return false;
  const precedence = {
    [orderStatus.PROCESSING]: 1,
    [orderStatus.SHIPPED]: 2,
    [orderStatus.DELIVERED]: 3,
  };
  if (precedence[newStatus] !== precedence[order.orderStatus] + 1) return false;
  return true;
};

const createOrderFilters = (filters) => {};

module.exports = {
  getReturnDate,
  OrderTotal,
  itemPrice,
  validateStatus,
  createOrderFilters,
};
