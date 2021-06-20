const UserDao = require('../dao/UserDao');
const {Validator} = require('../../model/Validator');

const { encrypt, decrypt, compare } = require('../../crypt');
const Constants = require('../../model/Constants');


function validateRegistration(userData) {
  let validator = new Validator((data)=>{
    if(!data.firstname){
      Validator.fail("No first name!");
    };
    if(!data.lastname){
      Validator.fail("No last name!");
    };
    if(!Constants.PasswordRegex.test(data.password)){
      Validator.fail("Invalid password!");
    };
    if(!Constants.EmailRegex.test(data.email)){
      Validator.fail("Invalid email!");
    };
  });
  return validator.validate(userData);
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
  let user = {...document};
  delete user.password;
  return user;
}



module.exports = class AuthService {

  static register(userData) {
    return new Promise( async (res,rej)=>{
      let validation = validateRegistration(req.body);
      if (!validation.ok) return rej(validation.msg);

      userData = encryptUserData(userData);
      console.log("Registering...",userData)

      let userDao = new UserDao();
      userDao.create(userData).then(user=>{
        console.log("Success!");
        res(packageUserDocument(user));
      })
      .catch((err)=>{
        console.log(err.code, err.keyValue);
        if (err.code = 11000) {
          rej("An account already exists for "+err.keyValue.email+"!")
        }
        rej(error);
      });
    });
  }

  static login(email,pw) {
    return new Promise( async (res,rej)=>{
      console.log("Attempting login...")
      let userDao = new UserDao();
      let userData = await userDao.findOne({ "email": email }).then(async (result)=>{
        return result;
      });
      if (!userData) return rej("Could not find account for that email.")
      if (!compare(pw, userData.password)) {
        return rej("Invalid password!")
      }
      res(packageUserDocument(userData));
    });
  }
}
