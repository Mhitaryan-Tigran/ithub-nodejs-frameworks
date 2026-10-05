const express = require('express')
const prisma = require('../db')
const validate = require('../middleware/validate')
const schemas = require('../schemas')
const { asyncHandler, httpError, paginate, meta } = require('../utils')

const router = express.Router()

const withRelations = { author: { select: { id: true, name: true, email: true } }, tags: { select: { id: true, name: true } } }

function tagLinks(names) {
  return names.map((name) => ({ where: { name }, create: { name } }))
}

router.get('/', validate(schemas.postList, 'query'), asyncHandler(async (req, res) => {
  const { search, published, authorId } = req.valid.query
  const p = paginate(req.valid.query)
  const where = {
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(published !== undefined && { published }),
    ...(authorId && { authorId })
  }
  const [total, data] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({ where, skip: p.skip, take: p.take, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], include: withRelations })
  ])
  res.json({ data, meta: meta(total, p) })
}))

router.get('/:id', validate(schemas.id, 'params'), asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.valid.params.id }, include: withRelations })
  if (!post) throw httpError(404, `Пост ${req.valid.params.id} не найден`)
  res.json({ data: post })
}))

router.post('/', validate(schemas.postCreate), asyncHandler(async (req, res) => {
  const { tags = [], ...fields } = req.valid.body
  const author = await prisma.user.findUnique({ where: { id: fields.authorId }, select: { id: true } })
  if (!author) throw httpError(400, `Автор ${fields.authorId} не существует`)
  const post = await prisma.post.create({
    data: { ...fields, tags: { connectOrCreate: tagLinks(tags) } },
    include: withRelations
  })
  res.status(201).location(`${req.baseUrl}/${post.id}`).json({ data: post })
}))

router.patch('/:id', validate(schemas.id, 'params'), validate(schemas.postUpdate), asyncHandler(async (req, res) => {
  const { tags, ...fields } = req.valid.body
  const post = await prisma.post.update({
    where: { id: req.valid.params.id },
    data: { ...fields, ...(tags && { tags: { set: [], connectOrCreate: tagLinks(tags) } }) },
    include: withRelations
  })
  res.json({ data: post })
}))

router.delete('/:id', validate(schemas.id, 'params'), asyncHandler(async (req, res) => {
  await prisma.post.delete({ where: { id: req.valid.params.id } })
  res.status(204).end()
}))

module.exports = router
