module.exports = class ServerError {
  constructor(message="Server Error",code=500) {
    this.message = message;
    this.code = code;
  }
}