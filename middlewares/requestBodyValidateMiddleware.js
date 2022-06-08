function requestBodyValidate(req, res, next){
  const { message, date } = req.body
  if(!message || !date || !new Date(date).getTime()) return res.status(400).send('Please provide message and date')
  next()
}

module.exports = requestBodyValidate
