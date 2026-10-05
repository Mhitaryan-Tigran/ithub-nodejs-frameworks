const crypto = require('crypto')
const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const config = require('../config')
const { emailQueue } = require('../queues/email')

function same(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

function sessionValue() {
  return crypto.createHmac('sha256', config.jwt.accessSecret).update(`${config.board.user}:${config.board.password}`).digest('hex')
}

function basicAuth(req, res, next) {
  if (!config.board.password) return res.status(404).send('Queue board is disabled')
  const cookie = (req.get('Cookie') || '').split(';').map((c) => c.trim().split('=')).find(([k]) => k === 'board')
  if (cookie && same(cookie[1], sessionValue())) return next()
  const [scheme, encoded] = (req.get('Authorization') || '').split(' ')
  const [user, password] = scheme === 'Basic' ? Buffer.from(encoded || '', 'base64').toString().split(':') : []
  if (same(user, config.board.user) && same(password, config.board.password)) {
    res.cookie('board', sessionValue(), { httpOnly: true, sameSite: 'strict', secure: config.env === 'production' && req.secure, path: '/admin/queues', maxAge: 8 * 60 * 60 * 1000 })
    return next()
  }
  res.set('WWW-Authenticate', 'Basic realm="queues"').status(401).send('Authentication required')
}

function queuesBoard(basePath) {
  const queue = emailQueue()
  if (!queue) return null
  const adapter = new ExpressAdapter()
  adapter.setBasePath(basePath)
  createBullBoard({ queues: [new BullMQAdapter(queue)], serverAdapter: adapter })
  return [basicAuth, adapter.getRouter()]
}

module.exports = { queuesBoard }
