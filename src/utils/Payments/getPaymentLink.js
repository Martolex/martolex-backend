const requests = require("./requests");
const { config: AppConfig } = require("../../config/config");
const config = require("./config");
const getPaymentLink = async (
  gatewayOrderId,
  {
    orderIds,
    orderAmount,
    customerEmail,
    customerName,
    customerPhone,
    existing = false,
  }
) => {
  if (!existing && (!orderIds || orderIds.length == 0)) {
    return new Error("Order IDs are required");
  }
  let data = !existing
    ? {
        appId: config.API_ID,
        secretKey: config.SECRET_KEY,
        orderId: gatewayOrderId,
        orderAmount: orderAmount,
        orderNote: `order for ${orderIds.join()}`,
        customerEmail: customerEmail,
        customerName: customerName,
        customerPhone: customerPhone,
        returnUrl: `${AppConfig.host}/payments/verify`,
      }
    : {
        appId: config.API_ID,
        secretKey: config.SECRET_KEY,
        orderId: gatewayOrderId,
      };

  const API = !existing
    ? config.endpoints.createOrder
    : config.endpoints.getExistingOrderLink;

  const response = await requests[API.method](API.url, data);
  if (response.status == "OK") {
    return response.paymentLink;
  } else {
    throw new Error(response.reason);
  }
};

module.exports = getPaymentLink;
