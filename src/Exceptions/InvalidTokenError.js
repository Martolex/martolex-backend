class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "INVALID_TOKEN";
    this.message = message;
  }
}

module.exports = InvalidTokenError;
