const path = require('path')
const { MongoMemoryServer } = require('mongodb-memory-server')

process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(__dirname, '../.mongodb-binaries')

async function main() {
  const dbPath = path.join(__dirname, '../.mongo-data')
  require('fs').mkdirSync(dbPath, { recursive: true })
  const server = await MongoMemoryServer.create({ instance: { port: 27017, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger' } })
  console.log(`Local MongoDB is running at ${server.getUri()} with data in .mongo-data`)
  const stop = async () => {
    await server.stop({ doCleanup: false })
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
