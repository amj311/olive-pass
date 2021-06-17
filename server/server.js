const express = require('express');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require("body-parser");
const cors = require("cors");
const Constants = require('../model/Constants');


require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const store = new MongoDBStore({
  uri: process.env.DB_URL+'/olive_pass',
  collection: 'sessions'
})
// Catch session store errors
store.on('error', function(error) {
  console.log(error);
});

app.use(session({
  name: "op-session",
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { 
    maxAge: Constants.SessionDuration,
    httpOnly: false,
  }
}));

// app.use(express.static('./'))
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://127.0.0.1",
  ],
  credentials: true,
  exposedHeaders: ["Set-Cookie"]
}));

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server listening on port '+port));

const MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
const { encrypt, compare, decrypt } = require('../crypt');
const Mailer = require('./Mailer');

let db;
let Users;
let Creds;
let EmailConfirms;
// connect to the database
MongoClient.connect(process.env.DB_URL+'/olive_pass', { useNewUrlParser: true, useUnifiedTopology: true }, (err,client)=>{
  if (err) return console.error(err)
  console.log('Connected to Database')
  db = client.db("olive_pass");
  Users = db.collection("users");
  Creds = db.collection("creds");
  EmailConfirms = db.collection("email_confirms");

  setupRoutes(app);
});




// Setup Mailer
const mailer = new Mailer({
  domain: process.env.MAIL_DOMAIN,
  apiKey: process.env.MAIL_API_KEY,
  sender: "OlivePass Support <no-reply@olivepass.com>"
})




// Logic
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
  return {_id, email,firstname,lastname}
}




// Middleware
function checkDbConnection(req, res, next) {
  if (!db) {
    return res.status(503).send("Database is not connected.");
  }
  next();
}

async function authGaurd(req, res, next) {
  if (!req.session.userId) {
    res.status(401).send("You are not logged in!")
    req.session.destroy();
    return;
  }
  
  let userData = await Users.findOne({ "_id":ObjectID(req.session.userId) }).then(async (result)=>{
    return result;
  });
  if (!userData) return res.status(401).send("Could not find user for session!")
  req.user = userData;
  req.session._garbage = Date();
  req.session.touch();
  next();
}



// Routes
function setupRoutes(app) {
  app.use("/api/", checkDbConnection);
  app.use("/api/", async (req, res, next)=>{
    if (["/register","/login"].includes(req.path)) return next();
    else authGaurd(req,res,next);
  });
  
  app.get("/api/", (req,res)=>{
    res.sendStatus(200);
  })
  
  app.post("/api/register", async (req, res)=> {
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
  
  app.post("/api/login", async (req, res)=> {
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
  
  app.post("/api/logout", (req, res)=> {
    res.setHeader("Set-Cookie", "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT")
    res.send("Logged out!");
    req.session.destroy();
    req.session = null;
  })
  
  
  const creds = require('./routes/creds');
  app.use('/api/creds', authGaurd);
  app.use('/api/creds', creds(db));
  
  
  app.post('/auth/sendEmail', async(req, res) => {
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
  
  
  
  
  
  app.use("/", function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).json({msg: 'Server Error', ok:false})
  })
}
