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

let db;
let Users;
let Creds;
// connect to the database
MongoClient.connect(process.env.DB_URL+'/olive_pass', { useNewUrlParser: true, useUnifiedTopology: true }, (err,client)=>{
  if (err) return console.error(err)
  console.log('Connected to Database')
  db = client.db("olive_pass");
  Users = db.collection("users");
  Creds = db.collection("creds");
});



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

function encryptCreds(creds) {
  if (creds.password) creds.password = encrypt(creds.password);
  return {...creds};
}

function packageCredsDocument(document) {
  document.password = "";
  delete document.userId;
  return {...document};
}






// Routes

app.get('/', function(req, res) {
  console.log(req.sessionID)
  res.send('Hello ' + JSON.stringify(req.session));
});

app.use("/api/", async (req, res, next)=>{
  if (!db) {
    return res.status(503).send("Database is not connected.");
  }
  if (["/register","/login"].includes(req.path)) return next();
  
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
});

app.get("/api/", (req,res)=>{
  res.sendStatus(200);
})

app.post("/api/register", async (req, res)=> {
  let validation = validateRegistration(req.body);
  if (!validation.ok) return res.status(400).send(validation.msg);
  
  let userData = encryptUserData(req.body);
  console.log("Registering...",userData)

  // let emailExists = await Users.findOne({ "email": userData.email }).then(async (result)=>{
  //   return result;
  // });
  // if (emailExists) return res.status(400).send("An account already exists for that email!")

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



// Fetch all creds
app.get('/api/creds/all', async (req, res) => {
  console.log("Get all Creds for user "+req.user._id);

  Creds.find({"userId": req.user._id}).toArray(function(err, list) {
    if (!err) {
      list = list.map(c => packageCredsDocument(c))
      res.status(200).json(list);
    }
  });
});



// Get creds for a domain
app.get('/api/creds/d/:domain', async (req, res) => {
  console.log("Get creds for  "+req.params.domain);

  Creds.find({"userId": req.user._id, "url": {$regex : `.*${req.params.domain}.*`}}).toArray(function(err, list) {
    if (!err) {
      list = list.map(c => packageCredsDocument(c))
      res.status(200).json(list);
    }
  });
});


// Decrypt cred password
app.get('/api/creds/p/:id', async (req, res) => {
  console.log("Decrypt cred "+req.params.id);

  Creds.findOne({"_id": new ObjectID(req.params.id)}).then(cred => {
    if (!cred) {
      return res.status(404).send("Could not find creds.")
    }
    res.status(200).send(decrypt(cred.password));
  });
});



// Create a new creds entry
app.post('/api/creds/create', async(req, res) => {
  let creds = encryptCreds(req.body);
  console.log("Create Creds", creds);

  creds.userId = req.user._id;

  Creds.insertOne(creds).then(result=>{
    // console.log(result.result)
    let success = result.insertedCount >= 1;
    if (success) {
      console.log("Saved!")
      res.status(201).json(packageCredsDocument(result.ops[0]));
    }
  })
  .catch((err)=>{
    console.log(err.code, err.keyValue);
    if (err.code = 11000) {
      let keys = err.keyValue;
      return res
        .status(400)
        .send("Nickname '"+keys.nickname+"' already exists for "+keys.url)
    }
    else next();
  });
});


// Update a resume in database
app.put('/api/creds/update', async(req, res) => {
  console.log("Update Cred");
  let id = req.body._id;
  delete req.body._id;

  let newCreds = encryptCreds(req.body);
  
  Creds.updateOne({ "_id": new ObjectID(id) }, { $set: newCreds })
    .then(result=>{
      let success = result.modifiedCount >= 1;
      if (success) {
        console.log("Saved!")
        res.sendStatus(200);
      }
      else {
        console.log("Not saved...")
        res.status(400).send("Could not save.");
      }
    })
    .catch(err=>{
      next()
    });
});


// Delete a creds in database
app.delete('/api/creds/:id', async(req, res) => {
  console.log("Delete creds");
  let id = req.params.id;
  
  Creds.deleteOne({ "_id": new ObjectID(id) }).then(result=>{
    let success = result.deletedCount == 1;
    if (success) {
      console.log("Deleted!")
      res.sendStatus(200);
    }
    else {
      console.log("Not deleted...")
      res.status(400).send("Could not delete creds "+id);
    }
  })
  .catch(err=>{
    console.log("Error:")
    res.sendStatus(500);
  });
});

app.use("/", function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({msg: 'Server Error', ok:false})
})