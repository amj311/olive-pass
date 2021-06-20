const Dao = require("./Dao");

module.exports = class CredsDao extends Dao {
  constructor() {
    super("creds");
  }

  getAllForUser(userId) {
    return this.filter({ "userId": userId });
  }
  
  getAllForUserForDomain(userId, domain) {
    return this.filter({ "userId": userId, "url": { $regex: `.*${domain}.*` } });
  }
}