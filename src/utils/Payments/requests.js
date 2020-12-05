const querystring = require("querystring");
const fetch = require("node-fetch");
const FormData = require("form-data");
module.exports.GET = (api, params = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    const allHeaders = {
      "Content-type": "application/json",
      ...headers,
    };

    const query = querystring.stringify(params);
    const url = api + (query.length > 0 ? "?" + query : "");
    const options = {
      method: "GET",
      headers: allHeaders,
    };
    fetch(url, options)
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });
};

module.exports.POST = (api, body = {}, headers = {}) => {
  const allHeaders = {
    ...headers,
  };

  const formData = new FormData();
  Object.keys(body).forEach((key) => {
    formData.append(key, body[key]);
  });
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      headers: allHeaders,
      body: formData,
      redirect: "follow",
    };
    fetch(api, options)
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });
};
