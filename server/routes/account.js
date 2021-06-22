const express = require('express');
const AccountService = require("../services/AccountService");
const HandleError = require("../HandleError")


const router = express.Router();

// req.body.email should be a string containing a valid email.
router.get('/confirm-email', async (req, res) => {
  AccountService.getEmailConfirmation(req.user._id).then(result=>{
    console.log(result);
    res.json(result)
  })
  .catch(error=>HandleError(error,res));
})

// req.body.email should be a string containing a valid email.
router.post('/start-confirm-email', async (req, res) => {
  AccountService.newEmailConfirmation(req.user._id,req.body.email).then(result=>{
    console.log(result);
    res.json(result)
  })
  .catch(error=>HandleError(error,res));
})


// req.body.code should be a string
router.post('/attempt-confirm-email', async (req, res) => {
  AccountService.attemptEmailConfirmation(req.user._id,req.body.code).then(result=>{
    console.log(result);
    res.json(result)
  })
  .catch(error=>HandleError(error,res));
});


let accountRouter = router;
module.exports = accountRouter;