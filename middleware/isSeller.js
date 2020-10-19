const isLoggedIn = require("./userLoggedIn");

module.exports = (req, res, next) => {
  isLoggedIn(req, res, () => {
    // return next();
    if (req.user.isSeller) return next();
    res.status(401).json({ code: 0, message: "you are not a seller" });
  });
};
