const log = require("../services/logger");

function errorHandler(err, req, res, next){
  log.error(err.message)
  res.status(500).send('Something broke!')
}

module.exports = errorHandler
