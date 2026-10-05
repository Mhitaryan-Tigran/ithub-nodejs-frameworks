const helmet = require('helmet')
const cors = require('cors')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const config = require('../config')

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true)
    callback(Object.assign(new Error(`Origin ${origin} не разрешён политикой CORS`), { status: 403 }))
  },
  credentials: true
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.loginRateLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Слишком много попыток входа, попробуйте через 15 минут' } })
})

module.exports = { helmet: helmet(), cors: cors(corsOptions), hpp: hpp(), loginLimiter }
