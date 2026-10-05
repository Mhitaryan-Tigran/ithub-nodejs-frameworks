const express = require('express')
const { getCatalog, getStats } = require('./catalog')

const app = express()

app.get('/api/products/stats', async (req, res, next) => {
  try {
    res.json({ data: await getStats() })
  } catch (error) {
    next(error)
  }
})

app.get('/api/products', async (req, res, next) => {
  try {
    res.json(await getCatalog(req.query))
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'InternalServerError' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Catalog API on http://localhost:${port}/api/products`))
