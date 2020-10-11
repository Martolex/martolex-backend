const isLoggedIn = require("./userLoggedIn");

module.exports = (req, res, next) => {
  isLoggedIn(req, res, () => {
    // return next();
    if (req.user.isAmbassador) return next();
    res.status(401).json({ code: 0, message: "you are not an ambassador" });
  });
};
