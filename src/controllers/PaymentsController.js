const { config } = require("../config/config");
const { Order } = require("../models");
const querystring = require("querystring");
const { paymentStatus } = require("../utils/enums");
const verifySignature = require("../utils/Payments/verifySignature");
const EmailBuilder = require("../services/EmailService");
const AWS = require("aws-sdk");
const Lambda = new AWS.Lambda();

AWS.config.update({ region: "ap-south-1" });

const PaymentController = {
  verifyPaymentCallBack: async (req, res) => {
    const paymentDetails = req.body;
    const USER_APP = `${config.applications.USER_APP}/order`;
    if (verifySignature(paymentDetails)) {
      if (paymentDetails.txStatus == "SUCCESS") {
        Order.update(
          {
            paymentStatus: paymentStatus.PAID,
            gatewayRefId: paymentDetails.referenceId,
            gateWayMode: paymentDetails.paymentMode,
          },
          { where: { gatewayOrderId: paymentDetails.orderId } }
        );

        const orderConfEmail = EmailBuilder.buildOrderConfEmail(
          paymentDetails.orderId
        );
        orderConfEmail.sendEmail((err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        });
        const orders = await Order.findAll({
          where: { gatewayOrderId: paymentDetails.orderId },
          attributes: ["id"],
        });
        const orderIds = orders.map((order) => order.id);
        const orderIdsQueryString = querystring.stringify({
          orders: orderIds,
        });
        redirectURL = `${USER_APP}/confirmation?${orderIdsQueryString}`;
        res.status(302).redirect(redirectURL);
      } else {
        redirectURL = `${USER_APP}/failure`;
      }
      res.status(302).redirect(redirectURL);
    } else {
      res.status(400).send({ code: 0, message: "unauthorized" });
    }
  },
};
module.exports = PaymentController;
