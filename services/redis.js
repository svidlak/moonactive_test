require('dotenv').config()
const { REDIS_KEY, REDIS_URL } = process.env

const log = require('./logger')
const { createClient } = require('redis')
const client = createClient({url: (REDIS_URL || null)})

async function init(){
    client.on("error", error => log.error(error))
    await client.connect();
}

async function saveNewMessage(data) {
    log.info('Saving: '+data.value)
    return client.zAdd(REDIS_KEY, [data])
}

async function getMessages(data, missed = false){
    const response = await client.zRangeByScore(REDIS_KEY, ...data)
    if(response.length > 0){
        if(missed) log.success('RESTART Missed Messages are: ')

        const sortedArr = response.reduce( (newArray, value) => {
            log.success(`${missed ? 'RESTART' : 'INTERVAL'}: ${value}`)
            newArray.push({score: 0, value: value})
            return newArray
        }, [])

        await client.zAdd(REDIS_KEY, sortedArr)
    } else {
        log.info(`${missed ? 'RESTART' : 'INTERVAL'}: No messages to get`)
    }
    return response
}
module.exports = {
    saveNewMessage,
    getMessages,
    init
}
