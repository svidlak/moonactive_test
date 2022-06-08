const {FETCH_MESSAGES_EVERY, REDIS_KEY, REDIS_KEY_MINUTES_TTL} = process.env
const RedisService = require("../services/redis");

async function getMissedMessagesFromRedis() {
  const fetchEvery = Number(FETCH_MESSAGES_EVERY) * 1000
  const currentTimestamp = new Date().getTime()

  try {
    await RedisService.init()
    const keys = await RedisService.getClusterKeys(REDIS_KEY)

    await Promise.all(keys
      .filter(keyName => filterOutFutureKeysByTimestamp(keyName))
      .map( keyName => RedisService.getMessages([1, currentTimestamp], keyName)))

    await fetchMessage()
  } catch (e){

  }

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

async function saveNewEntryToRedis({date, message}){
  const dateScore = new Date(date).getTime()
  const redisValue = {score: dateScore, value: message}

  const keyDate = new Date(date)
  keyDate.setSeconds(0)
  const keyTimestamp = keyDate.setMilliseconds(0)
  const key = `${REDIS_KEY}:${keyTimestamp}`

  await RedisService.saveNewMessage(redisValue, key)

  const pastTtl = 60 * Number(REDIS_KEY_MINUTES_TTL)
  const futureTtl = Math.ceil(((dateScore - new Date().getTime()) / 1000) + pastTtl)

  const ttlTime = new Date().getTime() >= keyTimestamp ? pastTtl : futureTtl

  await RedisService.setExpiration(key, ttlTime)
}

module.exports={
  getMissedMessagesFromRedis,
  saveNewEntryToRedis
}
