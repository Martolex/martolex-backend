const crypto = require("crypto-js");
const config = require("./config");

module.exports = (payload = {}) => {
  const { signature, ...data } = payload;

  const message = Object.values(data).reduce(
    (prev, curr) => (prev += curr),
    ""
  );

  const hash = crypto.HmacSHA256(
    crypto.enc.Utf8.parse(message),
    config.SECRET_KEY
  );
  const base64Hash = crypto.enc.Base64.stringify(hash);
  [];
  return signature == base64Hash;
};
