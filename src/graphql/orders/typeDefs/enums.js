const { gql } = require("apollo-server");

const enums = gql`
  enum PAYMENT_MODES {
    CASHFREE
    COD
  }
  enum PAYMENT_STATUS {
    PENDING
    PAID
    FAILED
  }
  enum ORDER_STATUS {
    PROCESSING
    SHIPPED
    INTRANSIT
    DELIVERED
  }
  enum PLANS {
    MONTHLY
    QUATERLY
    SEMIANNUAL
    ANNUAL
    SELL
  }

  enum AMBASSADOR_ORDER_SOURCES {
    LEADS
    COUPON_CODE
  }

  enum RETURN_STATES {
    NOT_RETURNED
    RETURN_REQUESTED
    RETURNED
    NOT_ELIGIBLE
  }
`;

module.exports = enums;
