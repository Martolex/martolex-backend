function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.status(401).json({ code: 0, message: "unauthorized" });
}

module.exports = isLoggedIn;
