class UserExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = "USER_EXISTS";
    this.message = message;
  }
}
class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "INVALID_TOKEN";
    this.message = message;
  }
}

module.exports = { UserExistsError, InvalidTokenError };
