const Dao = require("./Dao");

module.exports = class UserDao extends Dao {
  constructor() {
    super("users");
  }

}