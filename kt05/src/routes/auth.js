const express = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../db')
const config = require('../config')
const validate = require('../middleware/validate')
const schemas = require('../schemas')
const { authenticate } = require('../middleware/auth')
const { loginLimiter } = require('../middleware/security')
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt')
const { asyncHandler, httpError } = require('../utils/http')

const router = express.Router()
const COOKIE = 'refreshToken'
const publicUser = { id: true, email: true, name: true, role: true, createdAt: true }
const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy-password', config.bcryptRounds)

function cookieOptions() {
  return { httpOnly: true, secure: config.env === 'production', sameSite: 'strict', path: '/auth', maxAge: 7 * 24 * 60 * 60 * 1000 }
}

function issueTokens(res, user) {
  res.cookie(COOKIE, signRefresh(user), cookieOptions())
  return signAccess(user)
}

router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { email, name, password } = req.valid.body
  const hash = await bcrypt.hash(password, config.bcryptRounds)
  const user = await prisma.user.create({ data: { email, name, password: hash } })
  const accessToken = issueTokens(res, user)
  res.status(201).json({ data: { user: Object.fromEntries(Object.keys(publicUser).map((k) => [k, user[k]])), accessToken } })
}))

router.post('/login', loginLimiter, validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body
  const user = await prisma.user.findUnique({ where: { email } })
  const valid = await bcrypt.compare(password, user ? user.password : DUMMY_HASH)
  if (!user || !valid) throw httpError(401, 'Неверный email или пароль')
  const accessToken = issueTokens(res, user)
  res.json({ data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken } })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE]
  if (!token) throw httpError(401, 'Нет refresh token в cookie')
  let payload
  try {
    payload = verifyRefresh(token)
  } catch {
    throw httpError(401, 'Недействительный refresh token')
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user || user.tokenVersion !== payload.ver) throw httpError(401, 'Refresh token отозван')
  res.json({ data: { accessToken: issueTokens(res, user) } })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE]
  if (token) {
    try {
      const { sub } = verifyRefresh(token)
      await prisma.user.update({ where: { id: sub }, data: { tokenVersion: { increment: 1 } } })
    } catch {}
  }
  res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined })
  res.status(204).end()
}))

router.get('/me', authenticate, (req, res) => {
  res.json({ data: req.user })
})

module.exports = router
