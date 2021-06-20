const { encrypt, decrypt } = require('../../crypt');
const CredsDao = require('../dao/CredsDao');
const {Validator} = require('../../model/Validator');


function validateCreds(data) {
  let validator = new Validator((data)=>{
    if(!data.accountIdentifier){
      Validator.fail("No account!");
    };
    if(!data.password){
      Validator.fail("No password!");
    };
    if(!data.userId){
      Validator.fail("No user ID!");
    };
  });
  return validator.validate(data);
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

module.exports = class CredsService {
  static getAllUserCreds(userId, safe=true) {
    return new Promise((res,rej)=>{
      let credsDao = new CredsDao();
      credsDao.getAllForUser(userId).then(arr=>{
        if (safe) arr = arr.map(c => packageCredsDocument(c));
        res(arr);
      })
      .catch(error=>rej(error));
  
    });
  }
  
  static getAllUserCredsForDomain(userId, domain, safe=true) {
    return new Promise((res,rej)=>{
      let credsDao = new CredsDao();
      credsDao.getAllForUserForDomain(userId, domain).then(arr=>{
        if (safe) arr = arr.map(c => packageCredsDocument(c));
        res(arr);
      })
      .catch(error=>rej(error));
    })
  }

  static getCredPassword(credId) {
    return new Promise((res,rej)=>{
      let credsDao = new CredsDao();
      credsDao.getById(credId).then(cred=>{
        if (!cred) return rej("Could not find creds.");
        res(cred.password ? decrypt(cred.password) : null);
      })
      .catch(error=>rej(error));
    })
  }

  static createCred(data) {
    return new Promise((res,rej)=>{
      let validation = validateCreds(data);
      if (!validation.ok) {
        return rej(validation.msg);
      }
      let credsDao = new CredsDao();
      credsDao.create(encryptCreds(data)).then(cred=>{
        res(packageCredsDocument(cred));
      })
      .catch(error=>rej(error));
    })
  }

  static updateUserCred(credId,data) {
    return new Promise((res,rej)=>{
      let credsDao = new CredsDao();
      credsDao.update(credId,encryptCreds(data)).then(result=>{
        res(result);
      })
      .catch(error=>rej(error));
    });
  }


  static deleteUserCred(credId) {
    return new Promise((res,rej)=>{
      let credsDao = new CredsDao();
      credsDao.deleteById(credId).then(result=>{
        res(result);
      })
      .catch(error=>rej(error));
    });
  }

}
