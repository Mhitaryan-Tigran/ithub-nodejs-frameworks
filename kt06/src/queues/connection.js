const IORedis = require('ioredis')
const config = require('../config')

let connection = null

function redis() {
  if (!config.redisUrl) return null
  connection ||= new IORedis(config.redisUrl, { maxRetriesPerRequest: null, family: 0 })
  return connection
}

async function closeRedis() {
  if (connection) await connection.quit()
  connection = null
}

module.exports = { redis, closeRedis }
