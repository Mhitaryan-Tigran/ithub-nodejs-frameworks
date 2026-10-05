const http = require('http')
const app = require('./app')
const config = require('./config')
const prisma = require('./db')
const { attachSocket } = require('./realtime/socket')

const server = http.createServer(app)
const io = attachSocket(server)

server.listen(config.port, () => console.log(`Blog API (${config.env}) on http://localhost:${config.port}, chat at /chat.html, docs at /api/docs`))

function shutdown() {
  io.close()
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
