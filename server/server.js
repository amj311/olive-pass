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

const DbProvider = require('./dao/DbProvider');
const UserDao = require('./dao/UserDao');


// connect to the database
let dbProvider = new DbProvider();



// Middleware
function checkDbConnection(req, res, next) {
  if (!dbProvider.getDb()) {
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

  let userData = await new UserDao().getById(req.session.userId);
  if (!userData) return res.status(401).send("Could not find user for session!")
  req.user = userData;
  req.session._garbage = Date();
  req.session.touch();
  next();
}



app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https')
        return res.redirect('https://' + req.headers.host + req.url);
  }
  return next();
});

app.use("/api/", checkDbConnection);

app.use('/api/check-auth', authGaurd);
app.get("/api/check-auth", (req,res)=>{
  res.sendStatus(200);
})


const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);


const account = require('./routes/account');
app.use('/api/account', authGaurd);
app.use('/api/account', account);


const credsRouter = require('./routes/creds');
app.use('/api/creds', authGaurd);
app.use('/api/creds', credsRouter);

const HandleError = require('./HandleError');
app.use("/", function (err, req, res, next) {
  console.log("Error Catch-all:",err.message);
  console.error(err.stack)
  HandleError(error,res);
})
