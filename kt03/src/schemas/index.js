const Joi = require('joi')

const id = Joi.object({ id: Joi.number().integer().positive().required() })

const page = {
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100)
}

const userCreate = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  role: Joi.string().valid('USER', 'ADMIN')
})

const userUpdate = userCreate.fork(['email', 'name'], (field) => field.optional()).min(1)

const tags = Joi.array().items(Joi.string().trim().lowercase().min(1).max(30)).max(10).unique()

const postCreate = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  content: Joi.string().allow('', null).max(10000),
  published: Joi.boolean(),
  authorId: Joi.number().integer().positive().required(),
  tags
})

const postUpdate = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  content: Joi.string().allow('', null).max(10000),
  published: Joi.boolean(),
  tags
}).min(1)

const userList = Joi.object(page)

const postList = Joi.object({
  ...page,
  search: Joi.string().trim().max(100),
  published: Joi.boolean(),
  authorId: Joi.number().integer().positive()
})

module.exports = { id, userCreate, userUpdate, postCreate, postUpdate, userList, postList }
