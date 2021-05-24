module.exports = class Credentials {
  constructor(nickname, domain, accountIdentifier, password) {
    this.nickname = nickname;
    this.domain = domain;
    this.accountIdentifier = accountIdentifier;
    this.password = password;
  }
}