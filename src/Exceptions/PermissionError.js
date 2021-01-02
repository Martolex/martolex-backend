class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = "PERMISSION_ERROR";
    this.message = message;
  }
}

module.exports = PermissionError;
