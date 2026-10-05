const TOKENS = new Map([['valid-token', { username: 'admin', role: 'admin' }]])

module.exports = function auth(req, res, next) {
  const [scheme, token] = (req.get('Authorization') || '').split(' ')
  const user = scheme === 'Bearer' ? TOKENS.get(token) : undefined
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Нужен заголовок Authorization: Bearer <token>' })
  }
  req.user = user
  next()
}
