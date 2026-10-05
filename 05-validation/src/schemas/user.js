const Joi = require('joi')

const createUser = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  age: Joi.number().integer().min(0).max(150).required(),
  role: Joi.string().valid('user', 'admin').default('user')
})

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('name', 'age', 'email').default('name'),
  order: Joi.string().valid('asc', 'desc').default('asc')
})

module.exports = { createUser, listQuery }
