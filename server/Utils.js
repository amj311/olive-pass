module.exports.randDigits = function randDigits(length) {
  let digits = "";
  while (digits.length < length) {
    digits += (Math.floor(Math.random() * 9) + 1);
  }
  return digits;
}
