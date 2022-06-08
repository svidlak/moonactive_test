const RedisService = require("./services/redis");
const {REDIS_KEY} = process.env

function validateRequestBody(req, res, next){
  const { message, date } = req.body
  if(!message || !date || !new Date(date).getTime()) return res.status(400).send('Please provide message and date')
  next()
}

async function missedMessages(FETCH_MESSAGES_EVERY){
  const fetchEvery = Number(FETCH_MESSAGES_EVERY) * 1000
  const currentTimestamp = new Date().getTime()

  await RedisService.init()
  const keys = await RedisService.getClusterKeys(REDIS_KEY)

  await Promise.all(keys
    .filter(keyName => filterOutFutureKeysByTimestamp(keyName))
    .map( keyName => RedisService.getMessages([1, currentTimestamp], keyName)))

  await fetchMessage()

  async function fetchMessage(){
    return new Promise(async (resolve) => {
      setInterval(async ()=> {
        const date = new Date()
        const keyDate = new Date()

        const max = date.getTime()
        const min = date.setSeconds(date.getSeconds() - Number(FETCH_MESSAGES_EVERY))
        const dataToFetch = [min, max]

        keyDate.setSeconds(0)
        const keyName = `${REDIS_KEY}:${keyDate.setMilliseconds(0)}`

        await RedisService.getMessages(dataToFetch, keyName)
        resolve(true)
      }, fetchEvery)
    })
  }

  function filterOutFutureKeysByTimestamp(keyName){
    const [,keyTimestamp] = keyName.split(':')
    return currentTimestamp >= Number(keyTimestamp)
  }
}


module.exports = {
  validateRequestBody, missedMessages
}
