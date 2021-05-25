const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = process.env.OP_SECRET;
const secretIv = Buffer.from(process.env.OP_IV, 'hex');


function encrypt(text, iv) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('hex');
}

function decrypt(hash, iv) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  return Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]).toString();
}

module.exports.stringify = function(obj) {
  return encrypt(JSON.stringify(obj), secretIv);
}

module.exports.encrypt = (data) => {
  if (typeof data === "object") data = "$op"+JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  return module.exports.stringify({
    $op: iv.toString('hex'),
    content: encrypt(data, iv)
  });
};

module.exports.decrypt = (hash) => {
  let decrypted = JSON.parse(decrypt(hash, secretIv));
  if (decrypted.$op) decrypted = decrypt(decrypted.content, Buffer.from(decrypted.$op, 'hex'));
  if (decrypted.startsWith("$op")) decrypted = JSON.parse(decrypted.split("$op")[1])
  return decrypted;
};

module.exports.compare = function(data, hash) {
  return data === module.exports.decrypt(hash);
}