module.exports = function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true, convert: true })
    if (error) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Данные запроса не прошли проверку', details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })) }
      })
    }
    req.valid = { ...req.valid, [source]: value }
    next()
  }
}
