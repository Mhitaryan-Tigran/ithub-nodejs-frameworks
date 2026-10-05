const jwt = require('jsonwebtoken')
const config = require('../config')

function signAccess(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl })
}

function signRefresh(user) {
  return jwt.sign({ sub: user.id, ver: user.tokenVersion }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl })
}

function verifyAccess(token) {
  return jwt.verify(token, config.jwt.accessSecret)
}

function verifyRefresh(token) {
  return jwt.verify(token, config.jwt.refreshSecret)
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh }
