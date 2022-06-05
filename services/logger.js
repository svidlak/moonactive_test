const chalk = require('chalk')

function loggerType(color, message){
    console.log(chalk[color](message))
}
module.exports = {
    success: message => loggerType('green', message),
    error: message => loggerType('red', message),
    info: message => loggerType('yellow', message)
}
