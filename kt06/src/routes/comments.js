const express = require('express')
const prisma = require('../db')
const validate = require('../middleware/validate')
const schemas = require('../schemas')
const { authenticate } = require('../middleware/auth')
const { requirePermission, requireOwnership } = require('../middleware/rbac')
const { asyncHandler, httpError, paginate, meta } = require('../utils/http')

const author = { select: { id: true, name: true } }
const ownerOfComment = (req) => prisma.comment.findUnique({ where: { id: Number(req.params.id) }, select: { authorId: true } }).then((c) => (c ? c.authorId : null))

const byPost = express.Router({ mergeParams: true })

byPost.get('/', validate(schemas.id, 'params'), validate(schemas.commentList, 'query'), asyncHandler(async (req, res) => {
  const postId = req.valid.params.id
  if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) throw httpError(404, `Пост ${postId} не найден`)
  const p = paginate(req.valid.query)
  const [total, data] = await prisma.$transaction([
    prisma.comment.count({ where: { postId } }),
    prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' }, skip: p.skip, take: p.take, include: { author } })
  ])
  res.json({ data, meta: meta(total, p) })
}))

byPost.post('/', authenticate, requirePermission('comments:create'), validate(schemas.id, 'params'), validate(schemas.comment), asyncHandler(async (req, res) => {
  const postId = req.valid.params.id
  if (!(await prisma.post.findUnique({ where: { id: postId }, select: { id: true } }))) throw httpError(404, `Пост ${postId} не найден`)
  const comment = await prisma.comment.create({ data: { text: req.valid.body.text, postId, authorId: req.user.id }, include: { author } })
  res.status(201).location(`/api/comments/${comment.id}`).json({ data: comment })
}))

const single = express.Router()

single.get('/:id', validate(schemas.id, 'params'), asyncHandler(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.valid.params.id }, include: { author } })
  if (!comment) throw httpError(404, `Комментарий ${req.valid.params.id} не найден`)
  res.json({ data: comment })
}))

single.patch('/:id', authenticate, validate(schemas.id, 'params'), validate(schemas.comment), requireOwnership('comments:update', ownerOfComment), asyncHandler(async (req, res) => {
  const comment = await prisma.comment.update({ where: { id: req.valid.params.id }, data: { text: req.valid.body.text }, include: { author } })
  res.json({ data: comment })
}))

single.delete('/:id', authenticate, validate(schemas.id, 'params'), requireOwnership('comments:delete', ownerOfComment), asyncHandler(async (req, res) => {
  await prisma.comment.delete({ where: { id: req.valid.params.id } })
  res.status(204).end()
}))

module.exports = { byPost, single }
