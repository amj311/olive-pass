module.exports = class ServerError extends Error {
  constructor(message="Server Error",code=500) {
    super(message);
    this.message = message;
    this.code = code;
  }
}