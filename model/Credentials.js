module.exports = class Credentials {
  constructor(props={}) {
    this._id = props._id;
    this.nickname = props.nickname;
    this.url = props.url;
    this.accountIdentifier = props.accountIdentifier;
    this.password = props.password;    
  }
}