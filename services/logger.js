const chalk = require('chalk')

exports.success = message => console.log(chalk.green(message))
exports.error = message => console.log(chalk.red(message))
exports.normal = message => console.log(chalk.yellow(message))
