const express = require('express')
const { body, matchedData } = require('express-validator')
const { createUser, listQuery } = require('./schemas/user')
const { validate, expressValidatorErrors } = require('./middleware/validate')

const app = express()
app.use(express.json())

const users = []

app.get('/users', validate(listQuery, 'query'), (req, res) => {
  const { page, limit, sortBy, order } = req.validated.query
  const sorted = [...users].sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy]), 'en', { numeric: true }) * (order === 'desc' ? -1 : 1))
  res.json({ data: sorted.slice((page - 1) * limit, page * limit), query: req.validated.query })
})

app.post('/users', validate(createUser), (req, res) => {
  const user = { id: users.length + 1, ...req.validated.body }
  users.push(user)
  res.status(201).json(user)
})

app.post(
  '/v2/users',
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('name: от 2 до 50 символов'),
  body('email').trim().isEmail().withMessage('email: некорректный адрес').normalizeEmail(),
  body('age').isInt({ min: 0, max: 150 }).withMessage('age: целое число от 0 до 150').toInt(),
  expressValidatorErrors,
  (req, res) => {
    const user = { id: users.length + 1, ...matchedData(req, { locations: ['body'] }), role: 'user' }
    users.push(user)
    res.status(201).json(user)
  }
)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Validation demo on http://localhost:${port}`))
