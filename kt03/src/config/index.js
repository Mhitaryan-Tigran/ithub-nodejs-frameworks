const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true })

function number(name, fallback) {
  const value = Number(process.env[name] ?? fallback)
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`)
  return value
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set, see .env.example')

module.exports = {
  port: number('PORT', 3000),
  env: process.env.NODE_ENV || 'development',
  pageSize: number('PAGE_SIZE', 10),
  maxPageSize: number('MAX_PAGE_SIZE', 50)
}
