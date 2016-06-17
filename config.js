const env = require('./env.json')
const nodeEnv = process.env.NODE_ENV || 'development'

module.exports = env[nodeEnv]
