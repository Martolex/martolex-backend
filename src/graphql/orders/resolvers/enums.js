const enums = {
  PLANS: {
    MONTHLY: "oneMonth",
    QUATERLY: "threeMonth",
    SEMIANNUAL: "sixMonth",
    NINEMONTHS: "nineMonths",
    ANNUAL: "twelveMonths",
    SELL: "sellPrice",
  },
  returnStates: {
    NOT_RETURNED: 0,
    RETURN_REQUESTED: 1,
    RETURNED: 2,
    NOT_ELIGIBLE: -1,
  },
};

module.exports = enums;
