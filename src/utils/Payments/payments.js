const getPaymentLink = require("./getPaymentLink");
const { v4: UUIDV4 } = require("uuid");
const test = async () => {
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

test();
