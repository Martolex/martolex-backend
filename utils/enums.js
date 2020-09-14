const plans = {
  MONTHLY: "oneMonth",
  QUATERLY: "threeMonth",
  SEMIANNUAL: "sixMonth",
  NINEMONTHS: "nineMonths",
  ANNUAL: "twelveMonths",
};

const paymentModes = {
  CASHFREE: "CASHFREE",
  COD: "COD",
};
const paymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
};

module.exports = { plans, paymentModes, paymentStatus };
