const log = require('./logger')
const redis = require('redis')
const client = redis.createClient()

client.on("error", error => log.error(error))

exports.saveNewMessage = async data => {
    const message = data[2];
    log.normal('Saving: '+message)
    return await client.zadd(data)
}

exports.getMessages = (data, missed = false) => {
    /*
         update fetched messages to score of 0.
         according to the assignment it seems that you don't want
         the messages to be deleted (reduction of set length)
         probably because Index is also used ?
         although its not very memory efficient

         also, not bothering with Async Await or Callback, because I, personally,
         don't see it to be fit to this situation,
         although I know that services should be pure, and that this whole piece
         of code can be wrapped within a Promise for async functionality.

         for a "fullstack" project solution, regarding architecture, best practices, etc,
         you can have a look here:
         https://github.com/svidlak/node_react_app
    */

    client.zrangebyscore(data, (error, data) => {
        if(data.length > 0){
            if(missed) log.success('RESTART Missed Messages are: ')
            const sortedArray = data.reduce( (newArray, value) => {
                log.success(`${missed ? 'RESTART' : 'INTERVAL'}: ${value}`)
                newArray.push(0, value)
                return newArray
            }, [])

            sortedArray.unshift('messages')
            // overriding fetched messages with a score of 0, so next restart won't fetch the handled messages
            client.zadd(sortedArray, error => {
                if(error) log.error(error.message)
            })
        } else {
            log.normal(`${missed ? 'RESTART' : 'INTERVAL'}: No messages to get`)
        }
    })
}
