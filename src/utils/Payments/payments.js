const getPaymentLink = require("./getPaymentLink");
const { v4: UUIDV4 } = require("uuid");
const verifySignature = require("./verifySignature");
const testPaymentLink = async () => {
  try {
    const res = await getPaymentLink(UUIDV4(), {
      orderIds: [UUIDV4(), UUIDV4()],
      orderAmount: "200",
      customerEmail: "vanganideepanshu@gmail.com",
      customerName: "Deepanshu",
      customerPhone: "9167687712",
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};

const testSignatureVerification = () => {
  console.log(
    verifySignature({
      orderId: "1343a4a1-cbf5-47c9-bbb7-7ca949ca371c",
      orderAmount: "200.00",
      referenceId: "640302",
      txStatus: "SUCCESS",
      paymentMode: "CREDIT_CARD",
      txMsg: "Transaction Successful",
      txTime: "2020-12-05 23:22:02",
      signature: "l7ALfoCT+oRfWMb32EP3KSlSTLcHdBJtFYLdvYkQ5u8=",
    })
  );
};
testSignatureVerification();
// testPaymentLink();
