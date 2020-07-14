const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const Redis = require('./services/redis')
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

        const date = new Date(req.body.date)
        if(!date || !date.getTime()) throw new Error('bad date format')

        const dataToSave = ['messages', date.getTime(), req.body.message]
        const savedData = await Redis.saveNewMessage(dataToSave, req.body.message)
        res.status(200).json({data: savedData})

    }catch(e){
        log.error(e.message)
        res.status(400).json({error: e.message})
    }
})

// 404 handler
app.use( (req, res) => res.status(404).json({error: 'Route not found'}) )

app.listen(port, () => missedMessages() )

function missedMessages(){
    // express app logger moved here, because I wanted to keep the app.listen as a one liner
    log.normal(`Example app listening at http://localhost:${port}`)

    const dataToFetch = ['messages', 1, new Date().getTime()]
    Redis.missedMessages(dataToFetch)
}
