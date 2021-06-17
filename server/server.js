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
// connect to the database
MongoClient.connect(process.env.DB_URL+'/olive_pass', { useNewUrlParser: true, useUnifiedTopology: true }, (err,client)=>{
  if (err) return console.error(err)
  console.log('Connected to Database')
  db = client.db("olive_pass");
  Users = db.collection("users");
  setupRoutes(app);
});




// Setup Mailer
const mailer = new Mailer({
  domain: process.env.MAIL_DOMAIN,
  apiKey: process.env.MAIL_API_KEY,
  sender: process.env.MAIL_DEFAULT_SENDER,
})



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
  
  app.use('/api/check-auth', authGaurd);
  app.get("/api/check-auth", (req,res)=>{
    res.sendStatus(200);
  })
  
  const auth = require('./routes/auth');
  app.use('/api/auth', auth(db, mailer));
  
  
  const creds = require('./routes/creds');
  app.use('/api/creds', authGaurd);
  app.use('/api/creds', creds(db));
  
  
  
  
  app.use("/", function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).json({msg: 'Server Error', ok:false})
  })
}
