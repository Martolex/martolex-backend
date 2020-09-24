const jwt = require("jsonwebtoken");
const { config } = require("../config/config");
function isLoggedIn(req, res, next) {
  console.log(req.headers);
  if (req.headers.authorization) {
    const { authorization } = req.headers;
    const bearerToken = authorization.split(" ")[1];
    console.log(bearerToken);
    try {
      result = jwt.verify(bearerToken, config.jwtSecret);
      console.log(result);
      req.user = result;
      next();
    } catch (err) {
      console.log("here");
      res.status(401).send({ code: 0, message: "Something went wrong" });
    }
  } else {
    res.status(401).json({ code: 0, message: "unauthorized" });
  }
}

module.exports = isLoggedIn;
