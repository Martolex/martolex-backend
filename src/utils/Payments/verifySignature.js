const crypto = require("crypto-js");
const config = require("./config");

const base64Encode = (hash) => {
  const encodedWord = crypto.enc.Utf8.parse(hash); // encodedWord Array object
  const encoded = crypto.enc.Base64.stringify(encodedWord);
  return encoded;
};
module.exports = (payload = {}) => {
  const { signature, ...data } = payload;

  const orderedData = {};
  Object.keys(data)
    .sort()
    .forEach(function (key) {
      orderedData[key] = data[key];
    });
  const message = Object.values(orderedData).reduce(
    (prev, curr) => (prev += curr),
    ""
  );
  const hash = crypto.SHA256(message, config.SECRET_KEY).toString();
  const base64 = base64Encode(hash);
  console.log(base64);
  console.log(message);
  console.log(hash);
  return false;
};
