const express = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../db')
const config = require('../config')
const validate = require('../middleware/validate')
const schemas = require('../schemas')
const { authenticate } = require('../middleware/auth')
const { requirePermission, requireOwnership } = require('../middleware/rbac')
const { asyncHandler, httpError, paginate, meta } = require('../utils/http')

const router = express.Router()
const publicUser = { id: true, email: true, name: true, role: true, createdAt: true }
const ownerOfUser = (req) => prisma.user.findUnique({ where: { id: Number(req.params.id) }, select: { id: true } }).then((u) => (u ? u.id : null))

router.use(authenticate)

router.get('/', requirePermission('users:list'), validate(schemas.userList, 'query'), asyncHandler(async (req, res) => {
  const p = paginate(req.valid.query)
  const [total, data] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({ skip: p.skip, take: p.take, orderBy: { id: 'asc' }, select: { ...publicUser, _count: { select: { posts: true } } } })
  ])
  res.json({ data, meta: meta(total, p) })
}))

router.get('/:id', validate(schemas.id, 'params'), requireOwnership('users:read', ownerOfUser), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.valid.params.id },
    select: { ...publicUser, posts: { orderBy: { createdAt: 'desc' }, include: { tags: { select: { name: true } } } } }
  })
  if (!user) throw httpError(404, `Пользователь ${req.valid.params.id} не найден`)
  res.json({ data: user })
}))

router.patch('/:id', validate(schemas.id, 'params'), validate(schemas.userUpdate), requireOwnership('users:update', ownerOfUser), asyncHandler(async (req, res) => {
  const data = { ...req.valid.body }
  if (data.password) {
    data.password = await bcrypt.hash(data.password, config.bcryptRounds)
    data.tokenVersion = { increment: 1 }
  }
  const user = await prisma.user.update({ where: { id: req.valid.params.id }, data, select: publicUser })
  res.json({ data: user })
}))

router.delete('/:id', requirePermission('users:delete'), validate(schemas.id, 'params'), asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.valid.params.id } })
  res.status(204).end()
}))

module.exports = router
