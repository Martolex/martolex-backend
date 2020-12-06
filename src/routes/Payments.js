const router = require("express").Router();
const { config } = require("../config/config");
const { Order } = require("../models");
const querystring = require("querystring");
const { paymentStatus } = require("../utils/enums");
router.route("/verify").post(async (req, res) => {
  const paymentDetails = req.body;
  const USER_APP = `${config.applications.USER_APP}/order`;
  if (paymentDetails.txStatus == "SUCCESS") {
    Order.update(
      {
        paymentStatus: paymentStatus.PAID,
        gatewayRefId: paymentDetails.referenceId,
        gateWayMode: paymentDetails.paymentMode,
      },
      { where: { gatewayOrderId: paymentDetails.orderId } }
    );

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
});

module.exports = router;
