const config = require('../config')

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

function paginate(query) {
  const page = query.page || 1
  const limit = Math.min(query.limit || config.pageSize, config.maxPageSize)
  return { page, limit, skip: (page - 1) * limit, take: limit }
}

function meta(total, { page, limit }) {
  return { total, page, limit, pages: Math.ceil(total / limit) }
}

module.exports = { asyncHandler, httpError, paginate, meta }
