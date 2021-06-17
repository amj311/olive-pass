var ObjectID = require('mongodb').ObjectID;
const express = require('express');
const { encrypt, decrypt } = require('../../crypt');



function encryptCreds(creds) {
  if (creds.password) creds.password = encrypt(creds.password);
  return {...creds};
}

function packageCredsDocument(document) {
  document.password = "";
  delete document.userId;
  return {...document};
}



module.exports = function(db) {
  const router = express.Router();
  const Creds = db.collection("creds");

  // Fetch all creds
  router.get('/all', async (req, res) => {
    console.log("Get all Creds for user " + req.user._id);

    Creds.find({ "userId": req.user._id }).toArray(function (err, list) {
      if (!err) {
        list = list.map(c => packageCredsDocument(c))
        res.status(200).json(list);
      }
    });
  });



  // Get creds for a domain
  router.get('/d/:domain', async (req, res) => {
    console.log("Get creds for  " + req.params.domain);

    Creds.find({ "userId": req.user._id, "url": { $regex: `.*${req.params.domain}.*` } }).toArray(function (err, list) {
      if (!err) {
        list = list.map(c => packageCredsDocument(c))
        res.status(200).json(list);
      }
    });
  });


  // Decrypt cred password
  router.get('/p/:id', async (req, res) => {
    console.log("Decrypt cred " + req.params.id);

    Creds.findOne({ "_id": new ObjectID(req.params.id) }).then(cred => {
      if (!cred) {
        return res.status(404).send("Could not find creds.")
      }
      res.status(200).send(decrypt(cred.password));
    });
  });



  // Create a new creds entry
  router.post('/create', async (req, res) => {
    let creds = encryptCreds(req.body);
    console.log("Create Creds", creds);

    creds.userId = req.user._id;

    Creds.insertOne(creds).then(result => {
      // console.log(result.result)
      let success = result.insertedCount >= 1;
      if (success) {
        console.log("Saved!")
        res.status(201).json(packageCredsDocument(result.ops[0]));
      }
    })
      .catch((err) => {
        console.log(err.code, err.keyValue);
        if (err.code = 11000) {
          let keys = err.keyValue;
          return res
            .status(400)
            .send("Nickname '" + keys.nickname + "' already exists for " + keys.url)
        }
        else next();
      });
  });


  // Update a single cred
  router.put('/update', async (req, res) => {
    console.log("Update Cred");
    let id = req.body._id;
    delete req.body._id;

    let newCreds = encryptCreds(req.body);

    Creds.updateOne({ "_id": new ObjectID(id) }, { $set: newCreds })
      .then(result => {
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
      .catch(err => {
        next()
      });
  });


  // Delete a creds in database
  router.delete('/:id', async (req, res) => {
    console.log("Delete creds");
    let id = req.params.id;

    Creds.deleteOne({ "_id": new ObjectID(id) }).then(result => {
      let success = result.deletedCount == 1;
      if (success) {
        console.log("Deleted!")
        res.sendStatus(200);
      }
      else {
        console.log("Not deleted...")
        res.status(400).send("Could not delete creds " + id);
      }
    })
      .catch(err => {
        console.log("Error:")
        res.sendStatus(500);
      });
  });


  return router;
}