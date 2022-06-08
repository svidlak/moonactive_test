const { REDIS_URL } = process.env
const log = require('./logger')
const { createClient } = require('redis')
const client = createClient({url: (REDIS_URL || null)})

async function init(){
    client.on('error', error => log.error(error))
    client.on('connect', () => log.success(`Redis client Connected`));
    console.log(client.isOpen)
    await client.connect();
}

async function saveNewMessage(data, key) {
    log.info(`Saving: ${data.value} to key ${key}`)
    return client.zAdd(key, [data])
}

async function close(){
    log.info(`Closing Redis`)
    await client.disconnect()
}

async function getMessages(data, key){
    log.info(`Fetching messages from key ${key}`)
    const response = await client.zRangeByScore(key, ...data)
    if(response.length){
        log.success(`----KEY: ${key}----`)
        log.success(response.join(`\n`))
    } else {
        log.info(`No messages`)
    }
    return response
}

async function setExpiration(key, ttlInMinutes){
    log.info(`Setting expiration to key ${key}`)
    await client.expire(key, ttlInMinutes)
}

async function getClusterKeys(key){
    log.info(`Getting cluster keys from main key ${key}`)
    const { keys } = await client.scan(0, {MATCH: `${key}:*`})
    return keys
}

module.exports = {
    saveNewMessage,
    getMessages,
    init,
    close,
    getClusterKeys,
    setExpiration
}
