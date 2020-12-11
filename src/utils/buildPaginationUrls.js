const { config } = require("../config/config");
const querystring = require("querystring");

module.exports = (relUrl, offset, limit, currCount, currQuery) => {
  relUrl = relUrl.split("?")[0];
  prevPageparams = { ...currQuery, limit };
  nextPageParams = { ...currQuery, limit };
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
  console.log(
    config.host + relUrl + "?" + querystring.stringify(prevPageparams)
  );

  return {
    prevUrl: config.host + relUrl + "?" + querystring.stringify(prevPageparams),
    nextUrl: config.host + relUrl + "?" + querystring.stringify(nextPageParams),
  };
};
