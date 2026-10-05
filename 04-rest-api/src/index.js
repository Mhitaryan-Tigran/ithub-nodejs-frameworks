const express = require('express')
const usersRouter = require('./routes/users')

const app = express()
app.use(express.json())

app.use('/api/v1/users', usersRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'NotFound', message: `Маршрут ${req.method} ${req.originalUrl} не найден` })
})

app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({ error: status >= 500 ? 'InternalServerError' : 'RequestError', message: status >= 500 ? 'Внутренняя ошибка сервера' : err.message, ...(err.details && { details: err.details }) })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`REST API on http://localhost:${port}/api/v1`))
