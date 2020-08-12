const isLoggedIn = require("./userLoggedIn");

module.exports = (req, res, next) => {
  isLoggedIn(req, res, () => {
    if (req.user.isAdmin) return next();
    res.status(401).json({ code: 0, message: "you are not an admin" });
  });
};
