const prisma = require('../db')
const { closeRedis } = require('../queues/connection')
const { createEmailWorker } = require('./email')

const worker = createEmailWorker()
console.log('[worker] email worker started')

async function shutdown() {
  await worker.close()
  await closeRedis()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
