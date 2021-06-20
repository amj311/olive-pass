var ObjectID = require('mongodb').ObjectID;
const express = require('express');
const { encrypt, decrypt, compare } = require('../../crypt');
const Constants = require('../../model/Constants');


function randDigits(length) {
  let digits = "";
  while (digits.length < length) {
    digits += (Math.floor(Math.random() * 9) + 1);
  }
  return digits;
}

function isConfExpired(conf) {
  return Date.now() > conf.created + Constants.EmailCodeExpiration;
}

const router = express.Router();

// req.body.email should be a string containing a valid email.
router.post('/start-confirm-email', async (req, res) => {
  let existingConf = await EmailConfirms.findOne({ "userId": req.user._id }).then(async (result) => {
    return result;
  });
  if (existingConf) {
    let deleteSuccess = await EmailConfirms.deleteOne({ "userId": req.user._id }).then(async (result) => {
      return result.deletedCount == 1;
    })
      .catch(async e => {
        console.log(e);
        return false;
      });
    if (!deleteSuccess) return req.status(500).send("Encountered error with previous confirmation request.");
  }

  let code = randDigits(Constants.EmailCodeLength);
  let newConfirm = new EmailConfirmation(req.user._id, req.body.email, code);

  let createSuccess = await EmailConfirms.insertOne(newConfirm)
    .then(async result => {
      return result.insertedCount >= 1;
    })
    .catch(async (err) => {
      console.log(err);
      return false;
    });

  if (!createSuccess) {
    res.status(500).send("Encountered an error while confirming email!")
  }

  let msg = {
    to: req.body.email,
    subject: "Confirm Your Email",
    html: `
        <h1>Confirm Your Email</h1>
        <p>Use the following code to confirm your email with OlivePass:</p>
        <p><b>${code}</b></p>
      `
  }
  mailer.send(msg, (error, body) => {
    if (error) {
      console.log(error);
      return res.status(500).send("Server Error");
    }
    res.json(body);
  })

})


// req.body.code should be a string
router.post('/attempt-confirm-email', async (req, res) => {
  let tryCode = req.body.code;
  let matchingConf = await EmailConfirms.findOne({ "userId": req.user._id, "code": tryCode }).then(async (result) => {
    return result;
  });
  if (!matchingConf || isConfExpired(matchingConf)) return res.status(404).send("This email confirmation either does not exist or has expired.");

  EmailConfirms.deleteOne({ "userId": req.user._id });
  let newUserData = {
    email: matchingConf.email,
    isEmailConfirmed: true
  };
  Users.updateOne({ "_id": new ObjectID(req.user._id) }, { $set: newUserData })
    .then(result => {
      let success = result.modifiedCount >= 1;
      if (!success) {
        return res.status(500).send("Encountered error while confirming email. Please try again.")
      }
    })
    .catch(err => {
      console.log(err.code, err.keyValue);
      if (err.code = 11000) {
        return res.status(400).send("An account already exists for " + err.keyValue.email + "!")
      }
      return res.status(500).send("Encountered error while confirming email. Please try again.")
    })
});


let accountRouter = router;
module.exports = accountRouter;



class EmailConfirmation {
  constructor(userId, email, code) {
    this.userId = userId;
    this.email = email;
    this.code = code;
    this.created = Date.now();
  }
}