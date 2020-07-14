const chalk = require('chalk')

function loggerType(color, message){
    console.log(chalk[color](message))
}

exports.success = message => loggerType('green', message)
exports.error = message => loggerType('red', message)
exports.normal = message => loggerType('yellow', message)
