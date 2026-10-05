function notFound(req, res) {
  res.status(404).json({ error: 'NotFound', message: `Маршрут ${req.method} ${req.originalUrl} не найден` })
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: err.name || 'Error', message: status >= 500 ? 'Внутренняя ошибка сервера' : err.message, requestId: req.id })
}

module.exports = { notFound, errorHandler }
