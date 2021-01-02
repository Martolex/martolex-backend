const AWS = require("aws-sdk");
const { config } = require("../config/config");
AWS.config.update({ region: "ap-south-1" });
const Lambda = new AWS.Lambda();

class EmailService {
  constructor(type, params, options = {}) {
    const { lambdaName } = options;
    this.lambdaName = lambdaName || config.emailLambda;
    this.params = params;
    this.emailType = type;
  }

  sendEmail(callback) {
    const payload = {
      type: this.emailType,
      ...this.params,
    };
    const completePayload = {
      FunctionName: this.lambdaName,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(payload),
    };
    Lambda.invoke(completePayload, callback);
  }
}
class EmailBuilder {
  buildForgotPasswordEmail(emailId, link) {
    return new EmailService("FORGOT_PASSWORD", { email: emailId, link });
  }

  buildOrderConfEmail(orderId) {
    return new EmailService("ORDER_RECEIPT", { gatewayId: orderId });
  }
}

module.exports = new EmailBuilder();
