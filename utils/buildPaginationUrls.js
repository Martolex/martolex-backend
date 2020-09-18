const { config } = require("../config/config");
const querystring = require("querystring");

module.exports = (relUrl, offset, limit, currCount, currQuery) => {
  relUrl = relUrl.split("?")[0];
  console.log(currQuery);
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

  return {
    prevUrl:
      config.protocol +
      config.host +
      ":" +
      config.port +
      relUrl +
      "?" +
      querystring.stringify(prevPageparams),
    nextUrl:
      config.protocol +
      config.host +
      ":" +
      config.port +
      relUrl +
      "?" +
      querystring.stringify(nextPageParams),
  };
};
