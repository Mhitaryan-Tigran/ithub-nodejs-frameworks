const http = require('http')
const app = require('./app')
const config = require('./config')
const prisma = require('./db')
const { attachSocket } = require('./realtime/socket')
const { closeQueue } = require('./queues/email')
const { closeRedis } = require('./queues/connection')

const server = http.createServer(app)
const io = attachSocket(server)
const worker = config.runWorker ? require('./workers/email').createEmailWorker() : null
if (worker) console.log('[worker] email worker runs inside the web process')

server.listen(config.port, () => console.log(`Blog API (${config.env}) on http://localhost:${config.port}, chat at /chat.html, docs at /api/docs`))

function shutdown() {
  io.close()
  server.close(async () => {
    await worker?.close()
    await closeQueue()
    await closeRedis()
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
