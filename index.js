require('dotenv').config()
const {PORT} = process.env

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const RedisService = require('./services/redis')
const log = require('./services/logger')

const {requestBodyValidate, errorHandler, routeNotFound} = require('./middlewares')
const {getMissedMessagesFromRedis, saveNewEntryToRedis} = require("./controllers/redisController");

app.use(bodyParser.json())

app.post('/echoAtTime', requestBodyValidate, async (req, res, next) => {
    try {
        const {date, message} = req.body
        await saveNewEntryToRedis({date, message})
        res.sendStatus(201)
    } catch (e){
        next(e)
    }
});

app.use(routeNotFound)
app.use(errorHandler)

const httpServer = app.listen(PORT, async () => {
    log.info(`Example app listening at http://localhost:${PORT}`)
    getMissedMessagesFromRedis()
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
