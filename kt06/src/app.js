const path = require('path')
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const cookieParser = require('cookie-parser')
const config = require('./config')
const security = require('./middleware/security')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')
const adminRouter = require('./routes/admin')
const messagesRouter = require('./routes/messages')
const comments = require('./routes/comments')
const { queuesBoard } = require('./routes/queues')
const prisma = require('./db')
const { redis } = require('./queues/connection')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Blog API docs', swaggerOptions: { persistAuthorization: true } }))
const board = queuesBoard('/admin/queues')
if (board) app.use('/admin/queues', ...board)
app.use(security.helmet)
app.use(security.cors)
app.use(express.json({ limit: config.bodyLimit }))
app.use(express.urlencoded({ extended: false, limit: config.bodyLimit }))
app.use(security.hpp)
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

app.get('/health', async (req, res) => {
  const checks = {}
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = 'ok'
  } catch {
    checks.db = 'down'
  }
  const client = redis()
  if (client) checks.redis = await client.ping().then(() => 'ok', () => 'down')
  const ok = Object.values(checks).every((v) => v === 'ok')
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', ...checks })
})
app.use('/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/posts/:id/comments', comments.byPost)
app.use('/api/posts', postsRouter)
app.use('/api/comments', comments.single)
app.use(['/admin', '/api/admin'], adminRouter)
app.use('/api/messages', messagesRouter)
app.use(notFound)
app.use(errorHandler)

module.exports = app
