const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const bodyParser = require('body-parser')
const RedisService = require('./services/redis')
const log = require('./services/logger')
const {missedMessages, validateRequestBody} = require('./handlers')

app.use(bodyParser.json())

app.post('/echoAtTime', validateRequestBody, async (req, res, next) => {
    try {
        const date = new Date(req.body.date)
        const dataToSave = {score: date.setMilliseconds(0), value: req.body.message}
        await RedisService.saveNewMessage(dataToSave)
        res.sendStatus(201)
    } catch (e){
        next(e)
    }
})

app.use( (req, res) => res.status(404).send('Route not found') )
app.use((err, req, res, next) => {
    log.error(err.message)
    res.status(500).send('Something broke!')
})
app.listen(port, async () => {
    log.info(`Example app listening at http://localhost:${port}`)
    missedMessages()
})

