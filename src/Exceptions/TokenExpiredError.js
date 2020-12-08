class TokenExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = "TOKEN_EXPIRED";
    this.message = message;
  }
}

module.exports = TokenExpiredError;
