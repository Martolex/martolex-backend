const requests = require("./requests");
const config = require("./config");

const getPaymentLink = async (
  gatewayOrderId,
  { orderIds, orderAmount, customerEmail, customerName, customerPhone }
) => {
  if (!orderIds || orderIds.length == 0) {
    return new Error("Order IDs are required");
  }
  let data = {
    appId: config.API_ID,
    secretKey: config.SECRET_KEY,
    orderId: gatewayOrderId,
    orderAmount: orderAmount,
    orderNote: `order for ${orderIds.join()}`,
    customerEmail: customerEmail,
    customerName: customerName,
    customerPhone: customerPhone,
    returnUrl: "http://localhost:3000/payments/",
  };
  console.log(data);

  const API = config.endpoints.createOrder;

  const response = await requests[API.method](API.url, data);
  console.log(response);
  if (response.status == "OK") {
    return response.paymentLink;
  } else {
    throw new Error(response.reason);
  }
};

module.exports = getPaymentLink;
