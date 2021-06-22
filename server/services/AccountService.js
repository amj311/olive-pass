const EmailConfsDao = require('../dao/EmailConfsDao');
const Constants = require('../../model/Constants');
const MailerService = require('./MailerService');
const UserDao = require('../dao/UserDao');
const Dao = require('../dao/Dao');
const ServerError = require('../../model/ServerError');
const { randDigits } = require('../Utils');
const OTCDao = require('../dao/OTCDao');


function isConfExpired(conf) {
  return Date.now() > conf.created + Constants.EmailCodeExpiration;
}

function packageConfirmation(conf) {
  let out = {...conf};
  delete out.code;
  return out;
}

function packageOtc(otc) {
  return {
    email: otc.extras.email,
    userId: otc.uniqueKey
  }
}

function getOtcDao() {
  return new OTCDao('email-conf-otc',Constants.EmailCodeLength,Constants.EmailCodeExpiration);
}

module.exports = class AccountService {
  static async getEmailConfirmation(userId) {
    let confDao = new EmailConfsDao();
    let existingConf = await confDao.findOne({ "userId": userId })
    if (existingConf) {
      return packageConfirmation(existingConf);
    }
    else throw new ServerError("No confirmation.",404);
  }

  static async newEmailConfirmation(userId,email) {
    let otcDao = getOtcDao();
    let otc = await otcDao.newOTC(userId,{email});
  
    let msg = {
      to: email,
      subject: "Confirm Your Email",
      html: `
          <h1>Confirm Your Email</h1>
          <p>Use the following code to confirm your email with OlivePass:</p>
          <p><b>${otc.code}</b></p>
        `
    }

    let mailer = MailerService.getMailer();
    return new Promise((res,rej)=>{
      mailer.send(msg, (error, body) => {
        if (error) {
          console.log(error);
          throw new ServerError();
        }
        console.log(body)
        res(packageOtc(otc));
      })
    })
  }



  static async attemptEmailConfirmation(userId,tryCode) {
    let otcDao = getOtcDao();
    let otc = await otcDao.checkCode(tryCode,userId).catch(e=>{
      throw new ServerError("That code either does not exist or has expired.",404);
    });

    let newUserData = {
      email: otc.extras.email,
      isEmailConfirmed: true
    };

    let userDao = new UserDao();
    
    await userDao.update(Dao.IdFilter(userId),newUserData).catch(err=>{
      if (err.code = 11000 && err.keyValue && err.keyValue.email) {
        throw new ServerError("An account already exists for " + err.keyValue.email + "!",400)
      }
      throw new ServerError()
    })
    return newUserData;
  }

}