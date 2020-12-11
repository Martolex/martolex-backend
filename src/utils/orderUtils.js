const { Op } = require("sequelize");
const {
  plans,
  planDuration,
  orderStatus,
  paymentModes,
  paymentStatus,
  sellerTypes,
} = require("./enums");
const moment = require("moment");

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

const toArray = (items) => {
  return typeof items === "string" ? [items] : items;
};

const createOrderFilters = (filters) => {
  const requestFilters = {};
  if (filters.status) requestFilters.orderStatus = filters.status;

  if (filters.sellerTypes && typeof filters.sellerTypes === "string") {
    requestFilters["$user.isAdmin$"] = sellerTypes[filters.sellerTypes];
  }

  if (filters.paymentMethods) {
    requestFilters.paymentMode = { [Op.in]: toArray(filters.paymentMethods) };
  }

  if (filters.paymentStatus) {
    requestFilters.paymentStatus = { [Op.in]: toArray(filters.paymentStatus) };
  }
  if (filters.minOrderDate) {
    requestFilters.createdAt = {
      [Op.gte]: moment(filters.minOrderDate, "YYYY-MM-DD", true).toDate(),
    };
  }
  if (filters.maxOrderDate) {
    requestFilters.createdAt = {
      [Op.lte]: moment(filters.maxOrderDate, "YYYY-MM-DD", true).toDate(),
    };
  }

  return requestFilters;
};

const ValidateFilters = (filters) => {
  const contains = (corpus, items) => {
    return typeof items === "object"
      ? items.every((item) => corpus.includes(item))
      : corpus.includes(items);
  };
  if (
    filters.minOrderDate &&
    !moment(filters.minOrderDate, "YYYY-MM-DD", true).isValid()
  )
    throw new Error("minDate format is invalid");

  if (
    filters.maxOrderDate &&
    !moment(filters.maxOrderDate, "YYYY-MM-DD", true).isValid()
  )
    throw new Error("maxDate format is invalid");

  if (
    filters.sellerTypes &&
    !contains(Object.keys(sellerTypes), filters.sellerTypes)
  )
    return new Error("invalid sellerTypes");

  if (
    filters.paymentMethods &&
    !contains(Object.values(paymentModes), filters.paymentModes)
  )
    return new Error("invalid payment methods");

  if (
    filters.paymentStatus &&
    !contains(Object.values(paymentStatus), filters.paymentStatus)
  )
    return new Error("invalid payment status");

  if (filters.status && !Object.values(orderStatus).includes(filters.status))
    return new Error("invalid order status");
};

module.exports = {
  getReturnDate,
  OrderTotal,
  itemPrice,
  validateStatus,
  createOrderFilters,
  ValidateFilters,
};
