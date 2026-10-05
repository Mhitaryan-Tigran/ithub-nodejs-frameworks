const express = require('express')
const config = require('./config')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()
app.use(express.json({ limit: '100kb' }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use(notFound)
app.use(errorHandler)

app.listen(config.port, () => console.log(`Blog API on http://localhost:${config.port}`))
