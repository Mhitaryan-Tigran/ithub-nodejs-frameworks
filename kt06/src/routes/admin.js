const express = require('express')
const prisma = require('../db')
const validate = require('../middleware/validate')
const schemas = require('../schemas')
const { authenticate } = require('../middleware/auth')
const { requirePermission } = require('../middleware/rbac')
const { asyncHandler, httpError } = require('../utils/http')

const router = express.Router()

router.patch('/users/:id/role', authenticate, requirePermission('users:role'), validate(schemas.id, 'params'), validate(schemas.roleChange), asyncHandler(async (req, res) => {
  if (req.valid.params.id === req.user.id) throw httpError(400, 'Нельзя менять роль самому себе')
  const user = await prisma.user.update({
    where: { id: req.valid.params.id },
    data: { role: req.valid.body.role, tokenVersion: { increment: 1 } },
    select: { id: true, email: true, name: true, role: true }
  })
  res.json({ data: user })
}))

module.exports = router
