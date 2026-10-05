const prisma = require('../db')
const { verifyAccess } = require('../utils/jwt')
const { httpError } = require('../utils/http')

async function authenticate(req, res, next) {
  try {
    const [scheme, token] = (req.get('Authorization') || '').split(' ')
    if (scheme !== 'Bearer' || !token) throw httpError(401, 'Нужен заголовок Authorization: Bearer <access token>')
    let payload
    try {
      payload = verifyAccess(token)
    } catch (error) {
      throw httpError(401, error.name === 'TokenExpiredError' ? 'Access token истёк, обновите его через /auth/refresh' : 'Недействительный access token')
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true, role: true } })
    if (!user) throw httpError(401, 'Пользователь токена больше не существует')
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = { authenticate }
