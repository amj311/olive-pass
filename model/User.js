module.exports = class User {
  constructor(password, email, questions) {
    this.password = password;
    this.email = email;
    this.questions = questions;
  }
}