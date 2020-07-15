const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const RedisService = require('./services/redis')
const log = require('./services/logger')

app.use(bodyParser.json())

app.post('/echoAtTime', async (req, res) => {
    /*
        using here Async Await, because if error will be triggered, the catch part will handle it.
        less error handling for me.
        also, that's my reasoning for throwing errors inside try {} block, instead of handling
        each error individually
    */

    try{
        if(!req.body.message || !req.body.date) throw new Error('Please provide message and date')

        let date = new Date(req.body.date)
        if(!date || !date.getTime()) throw new Error('bad date format')

        /*
            setting milliseconds to 0, because I don't want to spam the local redis server
            with requests.
         */
        date = date.setMilliseconds(0)
        const dataToSave = ['messages', date, req.body.message]
        const savedData = await RedisService.saveNewMessage(dataToSave)
        res.status(200).json({data: savedData})

    }catch(e){
        log.error(e.message)
        res.status(400).json({error: e.message})
    }
})

// 404 handler
app.use( (req, res) => res.status(404).json({error: 'Route not found'}) )

app.listen(port, () => {
    log.normal(`Example app listening at http://localhost:${port}`)
    missedMessages()
})

function missedMessages(){
    const dataToFetch = ['messages', 1, new Date().getTime()]
    RedisService.getMessages(dataToFetch, true)
    fetchMessage()
}

function fetchMessage(){
    setInterval(()=> {
        // settings MS to 0, because all the score is being saved with MS of 0
        const score = new Date().setMilliseconds(0)
        const dataToFetch = ['messages', score, score]
        RedisService.getMessages(dataToFetch)
    }, 700)
}
