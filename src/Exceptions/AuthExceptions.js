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

class PasswordMismatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "PASSWORD_MISMATCH";
    this.message = message;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UNAUTHORIZED USER";
    this.message = message;
  }
}

class TokenExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = "TOKEN_EXPIRED";
    this.message = message;
  }
}

module.exports = {
  UserExistsError,
  InvalidTokenError,
  PasswordMismatchError,
  UnauthorizedError,
  TokenExpiredError,
};
