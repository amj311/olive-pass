class Validator {
  constructor(test) {
    this.test = test;
  }

  validate(data) {
    try {
      this.test(data);
    }
    catch(e) {
      return new ValidatorResult(false,e.message);
    };
    return new ValidatorResult(true);
  }

  static fail(msg) {
    throw new Error(msg);
  }
}

class ValidatorResult {
  constructor(ok,msg=null) {
    this.ok = ok;
    this.msg = msg;
  }
}

module.exports = {Validator,ValidatorResult};