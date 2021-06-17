var ObjectID = require('mongodb').ObjectID;
const express = require('express');
const { encrypt, decrypt, compare } = require('../../crypt');
const Constants = require('../../model/Constants');


function validateRegistration(userData) {
  if(!userData.firstname){
    return {ok:false, msg:"No first name!"}
  };
  if(!userData.lastname){
    return {ok:false, msg:"No last name!"}
  };
  if(!Constants.PasswordRegex.test(userData.password)){
    return {ok:false, msg:"Invalid password!"}
  };
  if(!Constants.EmailRegex.test(userData.email)){
    return {ok:false, msg:"Invalid email!"}
  };
  return {ok:true};
}

function encryptUserData(userData) {
  userData.password = encrypt(userData.password);
  if (userData.questions) {
    for (let rq of userData.questions) {
      rq.answer = encrypt(rq.answer);
    }
  }
  return userData;
}

function packageUserDocument(document) {
  let {_id,email,firstname,lastname} = document;
  return {_id, email, firstname, lastname}
}




module.exports = function(db, mailer) {
  const router = express.Router();
  const Users = db.collection("users");

  router.post("/register", async (req, res)=> {
    let validation = validateRegistration(req.body);
    if (!validation.ok) return res.status(400).send(validation.msg);
    
    let userData = encryptUserData(req.body);
    console.log("Registering...",userData)
  
    Users.insertOne(userData).then(result=>{
      // console.log(result.result)
      let success = result.insertedCount >= 1;
      if (success) {
        console.log("Saved!")
        res.status(200).json(packageUserDocument(result.ops[0]));
      }
    })
    .catch((err)=>{
      console.log(err.code, err.keyValue);
      if (err.code = 11000) {
        return res.status(400).send("An account already exists for "+err.keyValue.email+"!")
      }
      else next();
    });
  })
  
  router.post("/login", async (req, res)=> {
    console.log("Attempting login...")
    let userData = await Users.findOne({ "email": req.body.email }).then(async (result)=>{
      return result;
    });
    if (!userData) return res.status(404).send("Could not find account for that email.")
    if (!compare(req.body.password, userData.password)) {
      return res.status(400).send("Invalid password!")
    }
    req.session.userId = userData._id;
    res.json(packageUserDocument(userData));
  })
  
  router.post("/logout", (req, res)=> {
    if (!req.session.userId) return res.status(400).send("You are not logged in!");
    res.setHeader("Set-Cookie", "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT")
    res.send("Logged out!");
    req.session.destroy();
    req.session = null;
  })


  
  
  router.post('/sendEmail', async(req, res) => {
    let msg = {
      to: "amjudd315@gmail.com",
      subject: "Message From OlivePass",
      html: `
        <h1>Message from OlivePass</h1>
        <br>
        <p>Welcome aboard!</p>
      `
    }
    mailer.send(msg, (error, body)=>{
      if (error) {
        console.log(error);
        return res.status(500).send("Server Error");
      }
      res.json(body);
    })
  })
  
  
  

  return router;
}