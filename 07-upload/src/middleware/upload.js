const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')

const ROOT = path.join(__dirname, '../../uploads')

function storage(folder) {
  const dir = path.join(ROOT, folder)
  fs.mkdirSync(dir, { recursive: true })
  return multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`)
  })
}

function only(types, extensions) {
  return (req, file, cb) => {
    const ok = types.includes(file.mimetype) && extensions.includes(path.extname(file.originalname).toLowerCase())
    if (ok) return cb(null, true)
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname)
    error.message = `Недопустимый тип файла ${file.originalname} (${file.mimetype}). Разрешено: ${extensions.join(', ')}`
    cb(error)
  }
}

const images = only(['image/jpeg', 'image/png'], ['.jpg', '.jpeg', '.png'])
const documents = only(['text/plain', 'application/pdf', 'image/jpeg', 'image/png'], ['.txt', '.pdf', '.jpg', '.jpeg', '.png'])

module.exports = {
  avatar: multer({ storage: storage('avatars'), fileFilter: images, limits: { fileSize: 2 * 1024 * 1024, files: 1 } }),
  documents: multer({ storage: storage('documents'), fileFilter: documents, limits: { fileSize: 5 * 1024 * 1024, files: 5 } })
}
