const express = require('express')
const Joi = require('joi')
const prisma = require('../db')
const config = require('../config')
const validate = require('../middleware/validate')
const { authenticate } = require('../middleware/auth')
const { asyncHandler } = require('../utils/http')

const router = express.Router()
const query = Joi.object({
  room: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]{2,30}$/).default('general'),
  limit: Joi.number().integer().min(1).max(200).default(config.chat.historyLimit)
})

router.get('/', authenticate, validate(query, 'query'), asyncHandler(async (req, res) => {
  const { room, limit } = req.valid.query
  const data = await prisma.message.findMany({ where: { room }, orderBy: { id: 'desc' }, take: limit, include: { author: { select: { id: true, name: true } } } })
  res.json({ data: data.reverse(), meta: { room, count: data.length } })
}))

module.exports = router
