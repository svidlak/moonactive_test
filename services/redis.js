const log = require('./logger')
const redis = require('redis')
const client = redis.createClient()

client.on("error", error => log.error(error))

exports.saveNewMessage = async (data, message) => {
    log.normal('Saving: '+message)
    return await client.zadd(data)
}
exports.missedMessages = data => {
    client.zrangebyscore(data, (error, data) => {
        if(data.length > 0){
            log.success('Missed Messages are: ')
            const sortedArray = data.reduce( (newArray, value) => {
                log.success(value)
                newArray.push(0, value)
                return newArray
            }, [])

            // i'd rather use array unshift instead of spread (...) operator, to save memory
            sortedArray.unshift('messages')

            /*
                 update fetched messages to score of 0.
                 according to the home assignment it seems that you don't want
                 the messages to be deleted (reduction of set length)
                 probably because Index is also used ?
                 although its not very memory efficient
             */

            client.zadd(sortedArray, (error, data)=> {
                if(error) log.error(error.message)
            })
        } else {
            log.success('No messages to get, Great!')
        }
    })
}
