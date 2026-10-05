const express = require('express')
const store = require('../data/store')

const router = express.Router()
const SORTABLE = ['id', 'name', 'email', 'age']

function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

function findUser(id) {
  const user = store.users.find((u) => u.id === Number(id))
  if (!user) throw httpError(404, `Пользователь ${id} не найден`)
  return user
}

function checkFields(body, partial) {
  const errors = []
  if ((!partial || body.name !== undefined) && (typeof body.name !== 'string' || body.name.trim().length < 2)) errors.push('name: строка от 2 символов')
  if ((!partial || body.email !== undefined) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || '')) errors.push('email: некорректный адрес')
  if ((!partial || body.age !== undefined) && (!Number.isInteger(body.age) || body.age < 0 || body.age > 150)) errors.push('age: целое число 0–150')
  if (errors.length) throw Object.assign(httpError(400, 'Ошибка валидации'), { details: errors })
}

function checkEmailFree(email, exceptId) {
  if (store.users.some((u) => u.email === email && u.id !== exceptId)) {
    throw httpError(409, `Email ${email} уже занят`)
  }
}

router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
  const { minAge, maxAge, sortBy = 'id', order = 'asc' } = req.query
  if (!SORTABLE.includes(sortBy)) throw httpError(400, `sortBy должен быть одним из: ${SORTABLE.join(', ')}`)
  let result = store.users.filter((u) => (minAge === undefined || u.age >= Number(minAge)) && (maxAge === undefined || u.age <= Number(maxAge)))
  const direction = order === 'desc' ? -1 : 1
  result = [...result].sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0) * direction)
  const total = result.length
  res.json({ data: result.slice((page - 1) * limit, page * limit), meta: { total, page, limit, pages: Math.ceil(total / limit) } })
})

router.get('/:id', (req, res) => {
  res.json(findUser(req.params.id))
})

router.post('/', (req, res) => {
  checkFields(req.body, false)
  checkEmailFree(req.body.email)
  const user = { id: store.nextId(), name: req.body.name.trim(), email: req.body.email, age: req.body.age }
  store.users.push(user)
  res.status(201).location(`${req.baseUrl}/${user.id}`).json(user)
})

router.put('/:id', (req, res) => {
  const user = findUser(req.params.id)
  checkFields(req.body, false)
  checkEmailFree(req.body.email, user.id)
  Object.assign(user, { name: req.body.name.trim(), email: req.body.email, age: req.body.age })
  res.json(user)
})

router.patch('/:id', (req, res) => {
  const user = findUser(req.params.id)
  checkFields(req.body, true)
  if (req.body.email !== undefined) checkEmailFree(req.body.email, user.id)
  for (const key of ['name', 'email', 'age']) {
    if (req.body[key] !== undefined) user[key] = req.body[key]
  }
  res.json(user)
})

router.delete('/:id', (req, res) => {
  const user = findUser(req.params.id)
  store.users.splice(store.users.indexOf(user), 1)
  res.status(204).end()
})

router.get('/:id/orders', (req, res) => {
  const user = findUser(req.params.id)
  res.json({ data: store.orders.filter((o) => o.userId === user.id) })
})

module.exports = router
