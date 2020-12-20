module.exports.isValidPhone = (phone) => {
  var phonenoRegex = /^\d{10}$/;
  console.log(!phone.match(phonenoRegex));
  if (phone != "GOOGLE" && !phone.match(phonenoRegex)) {
    throw new Error("enter valid phoneNo");
  }
};

module.exports.isValidISBN = (isbn) => {
  if (isbn.length == 11 || isbn.length == 13) {
  } else {
    throw new Error("invalid isbn");
  }
};
