const express = require('express')
const prisma = require('../db')
const validate = require('../middleware/validate')
const schemas = require('../schemas')
const { asyncHandler, httpError, paginate, meta } = require('../utils')

const router = express.Router()

router.get('/', validate(schemas.userList, 'query'), asyncHandler(async (req, res) => {
  const p = paginate(req.valid.query)
  const [total, data] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({ skip: p.skip, take: p.take, orderBy: { id: 'asc' }, include: { _count: { select: { posts: true } } } })
  ])
  res.json({ data, meta: meta(total, p) })
}))

router.get('/:id', validate(schemas.id, 'params'), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.valid.params.id },
    include: { posts: { orderBy: { createdAt: 'desc' }, include: { tags: { select: { name: true } } } } }
  })
  if (!user) throw httpError(404, `Пользователь ${req.valid.params.id} не найден`)
  res.json({ data: user })
}))

router.post('/', validate(schemas.userCreate), asyncHandler(async (req, res) => {
  const user = await prisma.user.create({ data: req.valid.body })
  res.status(201).location(`${req.baseUrl}/${user.id}`).json({ data: user })
}))

router.patch('/:id', validate(schemas.id, 'params'), validate(schemas.userUpdate), asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.valid.params.id }, data: req.valid.body })
  res.json({ data: user })
}))

router.delete('/:id', validate(schemas.id, 'params'), asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.valid.params.id } })
  res.status(204).end()
}))

module.exports = router
