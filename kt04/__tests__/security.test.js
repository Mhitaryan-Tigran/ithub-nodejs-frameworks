const { app, prisma, request } = require('./helpers')

afterAll(() => prisma.$disconnect())

test('helmet sets protective headers', async () => {
  const res = await request(app).get('/health')
  expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
  expect(res.headers['x-content-type-options']).toBe('nosniff')
  expect(res.headers['content-security-policy']).toBeDefined()
  expect(res.headers['x-powered-by']).toBeUndefined()
})

test('CORS allows listed origins only', async () => {
  const allowed = await request(app).get('/health').set('Origin', 'http://localhost:5173')
  expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  const denied = await request(app).get('/health').set('Origin', 'https://evil.example')
  expect(denied.status).toBe(403)
})

test('bodies over 10kb are rejected with 413', async () => {
  const res = await request(app).post('/auth/login').send({ email: 'a@b.cd', password: 'x'.repeat(11 * 1024) })
  expect(res.status).toBe(413)
})

test('the 11th login attempt within 15 minutes gets 429', async () => {
  const statuses = []
  for (let i = 0; i < 11; i += 1) {
    statuses.push((await request(app).post('/auth/login').send({ email: 'nobody@test.dev', password: 'Wrong12345' })).status)
  }
  expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true)
  expect(statuses[10]).toBe(429)
})
