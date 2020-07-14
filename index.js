const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const redis = require('redis')
const client = redis.createClient()
const chalk = require('chalk')

app.use(bodyParser.json())

client.on("error", error => log.error(error))

app.post('/echoAtTime', async (req, res) => {

    /*
        using here Async Await, because if error will be triggered, the catch part will handle it.
        less error handling for me.
        also, that's my reasoning for throwing errors inside try {} block, instead of handling
        each error individually
    */

    try{
        if(!req.body.message || !req.body.date) throw new Error('Please provide message and date')

        const date = new Date(req.body.date)
        if(!date || !date.getTime()) throw new Error('bad date format')

        const dataToSave = ['messages', date.getTime(), req.body.message]
        const savedData = await client.zadd(dataToSave)
        res.status(200).json({data: savedData})

    }catch(e){
        log.error(e.message)
        res.status(400).json({error: e.message})
    }
})

// 404 handler
app.use( (req, res) => res.status(404).json({error: 'Route not found'}) )

app.listen(port, () => missedMessages())

function missedMessages(){
    // express app logger moved here, because I wanted to keep the app.listen as a one liner
    log.normal(`Example app listening at http://localhost:${port}`)

    const dataToFetch = ['messages', 1, new Date().getTime()]
    client.zrangebyscore(dataToFetch, (error, data) => {

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

const log = {
    success: message => console.log(chalk.green(message)),
    error: message => console.log(chalk.red(message)),
    normal: message => console.log(chalk.yellow(message))
}
