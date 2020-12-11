const config = require("../../config/config");

module.exports.API_ID =
  process.env.CASHFREE_API_ID || "44732aab419a889d25f76bc7f23744";

module.exports.SECRET_KEY =
  process.env.CASHFREE_SECRET || "cddc57061079ce23527601e52b2b8b8df86cdc11";

const CASHFREE_PROD_API = "https://api.cashfree.com";
const CASHFREE_TEST_API = "https://test.cashfree.com";
const CASHFREE_API =
  config.env == "dev" || config.env == "test"
    ? CASHFREE_TEST_API
    : CASHFREE_PROD_API;

module.exports.endpoints = {
  createOrder: { url: `${CASHFREE_API}/api/v1/order/create`, method: "POST" },
  getExistingOrderLink: {
    url: `${CASHFREE_API}/api/v1/order/info/link`,
    method: "POST",
  },
};
