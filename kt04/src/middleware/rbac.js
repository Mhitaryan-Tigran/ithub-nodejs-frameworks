const { can } = require('../config/permissions')
const { httpError } = require('../utils/http')

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return next(httpError(401, 'Нужна аутентификация'))
    if (!can(req.user.role, permission)) return next(httpError(403, `Роли ${req.user.role} не разрешено: ${permission}`))
    next()
  }
}

function requireOwnership(action, loadOwnerId) {
  return async (req, res, next) => {
    try {
      const ownerId = await loadOwnerId(req)
      if (ownerId === null) return next(httpError(404, 'Ресурс не найден'))
      const [resource, verb] = action.split(':')
      if (can(req.user.role, `${resource}:${verb}:any`)) return next()
      if (ownerId === req.user.id && can(req.user.role, `${resource}:${verb}:own`)) return next()
      next(httpError(403, 'Можно изменять только свои ресурсы'))
    } catch (error) {
      next(error)
    }
  }
}

module.exports = { requirePermission, requireOwnership }
