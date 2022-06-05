const RedisService = require("./services/redis");

function validateRequestBody(req, res, next){
  const { message, date } = req.body
  if(!message || !date || !new Date(date).getTime()) return res.status(400).send('Please provide message and date')
  next()
}

async function missedMessages(){
  try {
    const init = await RedisService.init()
    const dataToFetch = [1, new Date().getTime()]
    await RedisService.getMessages(dataToFetch, true)

    await fetchMessage()
  } catch (e){
    console.log(e)
  }


  async function fetchMessage(){
    return new Promise(async (resolve) => {
      setInterval(async ()=> {
        const score = new Date().setMilliseconds(0)
        const dataToFetch = [score, score]
        await RedisService.getMessages(dataToFetch)
        resolve(true)
      }, 700)
    })
  }
}

module.exports = {
  validateRequestBody, missedMessages
}
