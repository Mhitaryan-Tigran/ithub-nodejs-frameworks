const path = require('path')
const express = require('express')
const users = require('./users')

const app = express()
const ROLES = ['admin', 'editor', 'user']

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))
app.use(express.static(path.join(__dirname, '../public'), { maxAge: '1h' }))

app.locals.siteName = 'Team Directory'
app.locals.formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

app.get('/', (req, res) => {
  const counts = ROLES.map((role) => ({ role, count: users.filter((u) => u.role === role).length }))
  res.render('index', { title: 'Главная', total: users.length, counts })
})

app.get('/users', (req, res) => {
  const role = ROLES.includes(req.query.role) ? req.query.role : null
  res.render('users', { title: 'Пользователи', users: role ? users.filter((u) => u.role === role) : users, role, roles: ROLES })
})

app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id))
  if (!user) return res.status(404).render('404', { title: 'Не найдено', message: `Пользователя с id ${req.params.id} нет` })
  res.render('user', { title: user.name, user })
})

app.get('/emails/welcome/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id))
  if (!user) return res.status(404).render('404', { title: 'Не найдено', message: 'Получатель не найден' })
  res.render('emails/welcome', { user, loginUrl: `${req.protocol}://${req.get('host')}/users/${user.id}` })
})

app.use((req, res) => {
  res.status(404).render('404', { title: 'Не найдено', message: `Страницы ${req.path} нет` })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Templates demo on http://localhost:${port}`))
