const { Prisma } = require('@prisma/client')
const config = require('../config')

const PRISMA = {
  P2002: [409, 'CONFLICT', (e) => `Значение поля ${[].concat(e.meta?.target || []).join(', ')} уже занято`],
  P2025: [404, 'NOT_FOUND', () => 'Запись не найдена'],
  P2003: [400, 'BAD_REFERENCE', () => 'Связанная запись не существует']
}

const CODES = { 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'PAYLOAD_TOO_LARGE', 429: 'TOO_MANY_REQUESTS' }

function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Маршрут ${req.method} ${req.originalUrl} не найден` } })
}

function errorHandler(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && PRISMA[err.code]) {
    const [status, code, message] = PRISMA[err.code]
    return res.status(status).json({ error: { code, message: message(err) } })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: `Тело запроса больше ${config.bodyLimit}` } })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Тело запроса — некорректный JSON' } })
  }
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({
    error: { code: status >= 500 ? 'INTERNAL' : CODES[status] || 'REQUEST_ERROR', message: status >= 500 ? 'Внутренняя ошибка сервера' : err.message, ...(config.env !== 'production' && status >= 500 && { stack: err.stack }) }
  })
}

module.exports = { notFound, errorHandler }
