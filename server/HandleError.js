const ServerError = require("../model/ServerError");

module.exports = function HandleError(error,res) {
  console.log(error);
  if (error instanceof ServerError) {
    res.status(error.code || 500).send(error.message);
  }
  else res.status(500).send("Server Error");
}