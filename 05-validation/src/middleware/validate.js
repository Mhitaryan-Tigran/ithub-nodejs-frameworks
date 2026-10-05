const { validationResult } = require('express-validator')

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true, convert: true })
    if (error) {
      return res.status(400).json({
        error: 'ValidationError',
        details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
      })
    }
    req.validated = { ...req.validated, [source]: value }
    next()
  }
}

function expressValidatorErrors(req, res, next) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({
      error: 'ValidationError',
      details: result.array().map((e) => ({ field: e.path, message: e.msg, value: e.value }))
    })
  }
  next()
}

module.exports = { validate, expressValidatorErrors }
