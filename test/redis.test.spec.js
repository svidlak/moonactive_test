const assert = require("assert");
const RedisService = require("../services/redis");

describe('Tests Redis Client', function () {
  const timeStamp = new Date().setMilliseconds(0)
  const message = `TEST MESSAGE ${timeStamp}`

  before(async ()=> {
    await RedisService.init()
  })

  it('Should save new message', async ()=> {
    const dataToSave = {score: new Date().setMilliseconds(0), value: message}
    const resp = await RedisService.saveNewMessage(dataToSave)
    assert.equal(resp, '1', 'Message not Saved')
  })

  it('Should find created message', async ()=> {
    const dataToFetch = [1, new Date().getTime()]
    const messages = await RedisService.getMessages(dataToFetch, true)
    const found = messages.find(msg => msg === message)
    assert.equal(message, found, 'Message not Found')
  })

  it('Should NOT find created message', async ()=> {
    const dataToFetch = [1, new Date().getTime()]
    const messages = await RedisService.getMessages(dataToFetch, true)
    const found = messages.find(msg => msg === message)
    assert.equal(undefined, found, 'Message has not been reset to 0')
  })
});
