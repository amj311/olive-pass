const { randDigits } = require("../Utils");
const Dao = require("./Dao");

module.exports = class OTCDao extends Dao {
  constructor(collectionName, codeLength, codeExp) {
    super(collectionName);
    this.codeLength = codeLength;
    this.codeExp = codeExp;
  }


  static isExpired(otc) {
    return Date.now() > otc.created + otc.exp;
  }

  async newOTC(uniqueKey=null,extras=null) {
    console.log("Searching for previous OTC...")

    if (uniqueKey) {
      let prevOTC = await this.findOne({uniqueKey});
      if (prevOTC) {
        await this.delete(Dao.IdFilter(prevOTC._id)).catch(e => {
          console.log(e);
          throw new ServerError();
        });
      }
    }

    console.log("Creating new OTC...")

    let code = randDigits(this.codeLength);
    let newOTC = new OTC(uniqueKey, code, this.codeExp, extras);
  
    return new Promise((res,rej)=>{
      this.create(newOTC).then(otc=>{
        console.log(otc)
        res(otc);
      })
      .catch(async (err) => {
        console.log(err);
        throw new ServerError();
      });  
    })
  }


  async checkCode(tryCode,uniqueKey=null) {
    let filter = {"code":tryCode};
    if (uniqueKey) filter.uniqueKey = uniqueKey;
    let otcMatch = await this.findOne(filter).then(async (result) => {
      return result;
    });
    if (!otcMatch) throw new ServerError("No match.",404);
    if (OTCDao.isExpired(otcMatch)) throw new ServerError("OTC Expired",400);
    
    await this.delete(Dao.IdFilter(otcMatch._id));

    return otcMatch;
  }

}




class OTC {
  constructor(uniqueKey, code, exp, extras) {
    this.uniqueKey = uniqueKey;
    this.extras = extras;
    this.code = code;
    this.exp = exp;
    this.created = Date.now();
  }
}