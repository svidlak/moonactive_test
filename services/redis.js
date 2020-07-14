const log = require('./logger')
const redis = require('redis')
const client = redis.createClient()

client.on("error", error => log.error(error))

exports.saveNewMessage = async (data, message) => {
    log.normal('Saving: '+message)
    return await client.zadd(data)
}
exports.getMessages = (data, missed = false) => {
    client.zrangebyscore(data, (error, data) => {
        if(data.length > 0){
            if(missed) log.success('RESTART Missed Messages are: ')
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

                 also, not bothering with Async Await or Callback, because I, personally,
                 don't see it to be fit to this situation,
                 although I know that services should be pure.

                 for a "fullstack" project solution, regarding architecture, best practices, etc,
                 you can have a look here:
                 https://github.com/svidlak/node_react_app
             */

            client.zadd(sortedArray, (error, data)=> {
                if(error) log.error(error.message)
            })
        } else {
            log.success(missed ? 'RESTART' : 'INTERVAL' +': No messages to get, Great!')
        }
    })
}
