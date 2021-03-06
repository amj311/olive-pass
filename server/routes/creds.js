var ObjectID = require('mongodb').ObjectID;
const express = require('express');
const CredsService = require("../services/CredsService");
const HandleError = require('../HandleError');

const router = express.Router();


// Fetch one creds
router.get('/:id', async (req, res, next) => {
  if (req.params.id === "all") return next('route');
  CredsService.getCredById(req.params.id).then(cred => {
    res.json(cred);
  })
  .catch(err => HandleError(err,res));
});


// Fetch all creds
router.get('/all', async (req, res) => {
  console.log("Get all Creds for user " + req.user._id);

  CredsService.getAllUserCreds(req.user._id).then(list => {
    res.status(200).json(list);
  })
  .catch(err => HandleError(err,res));
});



// Get creds for a domain
router.get('/d/:domain', async (req, res) => {
  console.log("Get creds for  " + req.params.domain);

  CredsService.getAllUserCredsForDomain(req.user._id, req.params.domain).then(list => {
    res.status(200).json(list);
  })
  .catch(err => HandleError(err,res));
});


// Decrypt cred password
router.get('/p/:id', async (req, res) => {
  console.log("Decrypt cred " + req.params.id);

  CredsService.getCredPassword(req.params.id).then(pw => {
    res.status(200).send(pw);
  })
  .catch(err => HandleError(err,res));
});



// Create a new creds entry
router.post('/create', async (req, res) => {
  let data = req.body;
  data.userId = req.user._id;
  CredsService.createCred(data).then(cred => {
    res.status(201).json(cred);
  })
  .catch(err => HandleError(err,res));
});


// Update a single cred
router.put('/update', async (req, res) => {
  console.log("Update Cred");
  let id = req.body._id;

  CredsService.updateUserCred(id, req.body).then(result => {
    res.sendStatus(200);
  })
  .catch(err => HandleError(err,res));
});


// Delete a creds in database
router.delete('/:id', async (req, res) => {
  console.log("Delete creds");
  let id = req.params.id;

  CredsService.deleteUserCred(id).then(result => {
    res.sendStatus(200);
  })
  .catch(err => HandleError(err,res));
});

let credsRouter = router;
module.exports = credsRouter;