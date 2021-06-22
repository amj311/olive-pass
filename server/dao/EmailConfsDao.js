const Dao = require("./Dao");

module.exports = class EmailConfsDao extends Dao {
  constructor() {
    super("email-confs");
  }

}