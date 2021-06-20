const express = require('express');
const AuthService = require("../services/AuthService");


const router = express.Router();

router.post("/register", async (req, res) => {
  AuthService.register(req.body).then(user => {
    req.session.userId = user._id;
    res.json(user);
  })
    .catch(error => res.status(500).json(error));
})

router.post("/login", async (req, res) => {
  AuthService.login(req.body.email, req.body.password).then(user => {
    req.session.userId = user._id;
    res.json(user);
  })
  .catch(error => res.status(500).json(error));
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