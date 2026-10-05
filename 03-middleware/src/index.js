const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const requestId = require('./middleware/requestId')
const logger = require('./middleware/logger')
const auth = require('./middleware/auth')
const validateUser = require('./middleware/validateUser')
const { notFound, errorHandler } = require('./middleware/errors')

const app = express()
const users = []

app.use(requestId)
app.use(logger)
app.use(morgan('dev', { skip: () => process.env.NODE_ENV === 'test' }))
app.use(cors())
app.use(express.json({ limit: '10kb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()) })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'secret') {
    return res.json({ token: 'valid-token' })
  }
  res.status(401).json({ error: 'Unauthorized', message: 'Неверный логин или пароль' })
})

app.get('/profile', auth, (req, res) => {
  res.json({ user: req.user, requestId: req.id })
})

app.post('/users', auth, validateUser, (req, res) => {
  const user = { id: users.length + 1, name: req.body.name.trim(), age: req.body.age, city: req.body.city || null }
  users.push(user)
  res.status(201).json(user)
})

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server on http://localhost:${port}`))
