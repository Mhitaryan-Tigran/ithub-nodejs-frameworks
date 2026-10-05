const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true })

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set, see .env.example`)
  return value
}

function number(name, fallback) {
  const value = Number(process.env[name] ?? fallback)
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`)
  return value
}

function secret(name) {
  const value = required(name)
  if (value.length < 32) throw new Error(`${name} must be at least 32 characters`)
  return value
}

module.exports = {
  port: number('PORT', 3000),
  env: process.env.NODE_ENV || 'development',
  databaseUrl: required('DATABASE_URL'),
  pageSize: number('PAGE_SIZE', 10),
  maxPageSize: number('MAX_PAGE_SIZE', 50),
  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET'),
    refreshSecret: secret('JWT_REFRESH_SECRET'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d'
  },
  bcryptRounds: number('BCRYPT_ROUNDS', 10),
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
  loginRateLimit: number('LOGIN_RATE_LIMIT', 10),
  bodyLimit: process.env.BODY_LIMIT || '10kb',
  chat: {
    messageMax: number('CHAT_MESSAGE_MAX', 1000),
    historyLimit: number('CHAT_HISTORY_LIMIT', 50)
  }
}
