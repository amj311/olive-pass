const UserDao = require('../dao/UserDao');
const {Validator} = require('../../model/Validator');

const { encrypt, decrypt, compare } = require('../../crypt');
const Constants = require('../../model/Constants');
const ServerError = require('../../model/ServerError');


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

  static async register(userData) {
    let validation = validateRegistration(userData);
    if (!validation.ok) throw new ServerError(validation.msg,400);

    userData = encryptUserData(userData);
    console.log("Registering...",userData)

    let userDao = new UserDao();
    let user = await userDao.create(userData).then(user=>{
      console.log("Success!");
      return user;
    })
    .catch((err)=>{
      console.log(err.code, err.keyValue);
      if (err.code = 11000) {
        throw new ServerError("An account already exists for "+err.keyValue.email+"!",400);
      }
      throw new ServerError();
    });
    return packageUserDocument(user);
  }

  static async login(email,pw) {
    console.log("Attempting login...")
    let userDao = new UserDao();
    let userData = await userDao.findOne({ "email": email }).then(async (result)=>{
      return result;
    });
    if (!userData) throw new ServerError("Could not find account for that email.",400)
    if (!compare(pw, userData.password)) {
      throw new ServerError("Invalid password!",400)
    }
    return packageUserDocument(userData);
  }
}
