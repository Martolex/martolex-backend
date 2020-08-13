const { config } = require("../config/config");
const querystring = require("querystring");

module.exports = (relUrl, offset, limit, currCount) => {
  prevPageparams = { limit };
  nextPageParams = { limit };
  if (offset != 0) {
    prevPageparams.offset = offset - limit;
    if (limit == currCount) {
      nextPageParams.offset = offset + limit;
    }
  } else {
    if (limit == currCount) {
      nextPageParams.offset = offset + limit;
    }
  }

  return {
    prevUrl: config.host + relUrl + "?" + querystring.stringify(prevPageparams),
    nextUrl: config.host + relUrl + "?" + querystring.stringify(nextPageParams),
  };
};
