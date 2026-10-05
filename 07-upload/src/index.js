const path = require('path')
const express = require('express')
const multer = require('multer')
const upload = require('./middleware/upload')

const app = express()
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

function describe(file) {
  return { field: file.fieldname, originalName: file.originalname, mimeType: file.mimetype, size: file.size, url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}` }
}

app.post('/upload/avatar', upload.avatar.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'ValidationError', message: 'Поле avatar с файлом обязательно' })
  res.status(201).json({ file: describe(req.file) })
})

app.post('/upload/documents', upload.documents.array('documents', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'ValidationError', message: 'Нужен хотя бы один файл в поле documents' })
  res.status(201).json({ count: req.files.length, files: req.files.map(describe) })
})

app.post('/upload/profile', upload.avatar.single('avatar'), (req, res) => {
  const { name, bio } = req.body
  if (!name) return res.status(400).json({ error: 'ValidationError', message: 'Поле name обязательно' })
  res.status(201).json({ profile: { name, bio: bio || '', avatar: req.file ? describe(req.file) : null } })
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    return res.status(status).json({ error: err.code, message: err.code === 'LIMIT_FILE_SIZE' ? 'Файл больше допустимого размера' : err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'InternalServerError', message: 'Внутренняя ошибка сервера' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Upload demo on http://localhost:${port}`))
