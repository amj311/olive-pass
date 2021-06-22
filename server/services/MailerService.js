const Mailer = require("../Mailer")

function newMailer() {
  // Setup Mailer
  const mailer = new Mailer({
    domain: process.env.MAIL_DOMAIN,
    apiKey: process.env.MAIL_API_KEY,
    sender: process.env.MAIL_DEFAULT_SENDER,
  })
  return mailer;
}



module.exports = class MailerService {

  static getMailer() {
    return newMailer();
  }
  
}


