const Constants = require("./Constants")

module.exports = class Session {
  constructor(props) {
    this.userId = props.userId;
    this.id = props.id;
    this.expires = props.expires || Date.now() + Constants.SessionDuration;
  }
}