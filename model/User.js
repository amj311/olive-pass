module.exports = class User {
  constructor(username, password, email, questions) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.questions = questions;
  }
}