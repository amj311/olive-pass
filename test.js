require("dotenv").config();

const {encrypt, decrypt, compare} = require("./crypt");

console.log(process.env.OP_SECRET)

let code;

code = encrypt("this text");
console.log(code);
console.log(decrypt(code));

console.log(compare("this text", code));
console.log(compare("that text", code));

code = encrypt({username: "ajudd315", pwd: "mypass"});
console.log(code);
console.log(decrypt(code))