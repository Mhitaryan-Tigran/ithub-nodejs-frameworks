const { Server } = require('socket.io')
const prisma = require('../db')
const config = require('../config')
const { verifyAccess } = require('../utils/jwt')

const ROOM = /^[a-z0-9-]{2,30}$/
const GENERAL = 'general'
const author = { select: { id: true, name: true } }

function tokenFrom(socket) {
  const header = socket.handshake.headers.authorization || ''
  return socket.handshake.auth?.token || (header.startsWith('Bearer ') ? header.slice(7) : null)
}

function cleanText(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new Error('Пустое сообщение')
  if (text.length > config.chat.messageMax) throw new Error(`Сообщение длиннее ${config.chat.messageMax} символов`)
  return text
}

function cleanRoom(value) {
  const room = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!ROOM.test(room) || room === GENERAL) throw new Error('Имя комнаты: 2–30 символов a-z, 0-9 и дефис')
  return room
}

function handler(fn) {
  return async (payload, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {}
    try {
      reply({ ok: true, data: await fn(payload || {}) })
    } catch (error) {
      reply({ ok: false, error: error.message })
    }
  }
}

async function authenticate(socket, next) {
  const token = tokenFrom(socket)
  if (!token) return next(new Error('Нужен access token: io({ auth: { token } })'))
  let payload
  try {
    payload = verifyAccess(token)
  } catch (error) {
    return next(new Error(error.name === 'TokenExpiredError' ? 'Access token истёк' : 'Недействительный access token'))
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, role: true } })
  if (!user) return next(new Error('Пользователь токена не существует'))
  socket.data.user = user
  next()
}

function attachSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: config.corsOrigins, credentials: true } })
  const online = new Map()

  io.use((socket, next) => authenticate(socket, next).catch(next))

  io.on('connection', (socket) => {
    const { user } = socket.data
    const entry = online.get(user.id) || { user, sockets: 0 }
    entry.sockets += 1
    online.set(user.id, entry)
    socket.join(GENERAL)
    socket.emit('users:online', [...online.values()].map((e) => e.user))
    if (entry.sockets === 1) socket.broadcast.emit('user:online', user)

    socket.on('message:send', handler(async ({ text }) => {
      const message = await prisma.message.create({ data: { room: GENERAL, text: cleanText(text), authorId: user.id }, include: { author } })
      io.to(GENERAL).emit('message:new', message)
      return message
    }))

    socket.on('room:join', handler(async ({ room }) => {
      const name = cleanRoom(room)
      await socket.join(name)
      socket.to(name).emit('room:joined', { room: name, user })
      const history = await prisma.message.findMany({ where: { room: name }, orderBy: { id: 'desc' }, take: config.chat.historyLimit, include: { author } })
      return { room: name, history: history.reverse() }
    }))

    socket.on('room:leave', handler(async ({ room }) => {
      const name = cleanRoom(room)
      await socket.leave(name)
      socket.to(name).emit('room:left', { room: name, user })
      return { room: name }
    }))

    socket.on('room:message', handler(async ({ room, text }) => {
      const name = cleanRoom(room)
      if (!socket.rooms.has(name)) throw new Error(`Сначала войдите в комнату ${name}`)
      const message = await prisma.message.create({ data: { room: name, text: cleanText(text), authorId: user.id }, include: { author } })
      io.to(name).emit('room:message', message)
      return message
    }))

    socket.on('disconnect', () => {
      const current = online.get(user.id)
      if (!current) return
      current.sockets -= 1
      if (current.sockets === 0) {
        online.delete(user.id)
        io.emit('user:offline', user)
      }
    })
  })

  return io
}

module.exports = { attachSocket }
