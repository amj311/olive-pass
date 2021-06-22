const express = require('express');
const HandleError = require('../HandleError');
const AuthService = require("../services/AuthService");


const router = express.Router();

router.post("/register", async (req, res) => {
  AuthService.register(req.body).then(user => {
    req.session.userId = user._id;
    res.json(user);
  })
  .catch(err => HandleError(err,res));
})

router.post("/login", async (req, res) => {
  AuthService.login(req.body.email, req.body.password).then(user => {
    req.session.userId = user._id;
    res.json(user);
  })
  .catch(err => HandleError(err,res));
})

router.post("/login/otc/new", async (req, res) => {
  AuthService.newEmailOtcLogin(req.body.userId).then(result => {
    res.sendStatus(200);
  })
  .catch(err => HandleError(err,res));
})
router.post("/login/otc/attempt", async (req, res) => {
  AuthService.attemptOtcLogin(req.body.userId,req.body.code).then(user => {
    req.session.userId = user._id;
    res.json(user);
  })
  .catch(err => HandleError(err,res));
})

router.post("/logout", (req, res) => {
  if (!req.session.userId) return res.status(400).send("You are not logged in!");
  res.setHeader("Set-Cookie", "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT")
  res.send("Logged out!");
  req.session.destroy();
  req.session = null;
})

let authRouter = router;
module.exports = authRouter;