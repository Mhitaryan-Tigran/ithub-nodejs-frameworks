module.exports = function validateUser(req, res, next) {
  const { name, age, city } = req.body
  const errors = []
  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'name — строка не короче 2 символов' })
  }
  if (!Number.isInteger(age) || age < 0 || age > 150) {
    errors.push({ field: 'age', message: 'age — целое число от 0 до 150' })
  }
  if (city !== undefined && typeof city !== 'string') {
    errors.push({ field: 'city', message: 'city — строка' })
  }
  if (errors.length) {
    return res.status(400).json({ error: 'ValidationError', details: errors })
  }
  next()
}
