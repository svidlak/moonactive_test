const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const RedisService = require('./services/redis')
const log = require('./services/logger')
const {missedMessages, validateRequestBody} = require('./handlers')
const {PORT, FETCH_MESSAGES_EVERY, REDIS_KEY, REDIS_KEY_MINUTES_TTL} = process.env


app.use(bodyParser.json())

app.post('/echoAtTime', validateRequestBody, async (req, res, next) => {
    try {
        const {date, message} = req.body

        const keyDate = new Date(date)
        keyDate.setSeconds(0)
        const keyTimestamp = keyDate.setMilliseconds(0)
        const key = `${REDIS_KEY}:${keyTimestamp}`

        const dateScore = new Date(date).getTime()
        const redisValue = {score: dateScore, value: message}
        await RedisService.saveNewMessage(redisValue, key)

        const pastTtl = 60 * Number(REDIS_KEY_MINUTES_TTL)
        const futureTtl = Math.ceil(((dateScore - new Date().getTime()) / 1000) + pastTtl)

        const ttlTime = new Date().getTime() >= keyTimestamp ? pastTtl : futureTtl

        await RedisService.setExpiration(key, ttlTime)

        res.sendStatus(201)
    } catch (e){
        next(e)
    }
});

app.use( (req, res) =>
  res.status(404).send('Route not found') );

app.use((err, req, res, next) => {
    log.error(err.message)
    res.status(500).send('Something broke!')
});

const httpServer = app.listen(PORT, async () => {
    log.info(`Example app listening at http://localhost:${PORT}`)
    missedMessages(FETCH_MESSAGES_EVERY)
});

['SIGTERM', 'SIGINT'].forEach(event => shutdownServer(event))

function shutdownServer(event){
    process.on(event,() => {
        log.info('Shutting Down');
        httpServer.close(async ()=> {
            await RedisService.close()
        })
    })
}
