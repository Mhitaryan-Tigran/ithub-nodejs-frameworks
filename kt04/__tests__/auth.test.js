const { app, prisma, request, reset, auth, PASSWORD } = require('./helpers')

beforeEach(reset)
afterAll(() => prisma.$disconnect())

const alice = { email: 'alice@test.dev', name: 'Alice', password: PASSWORD }

describe('POST /auth/register', () => {
  test('creates a user, hashes the password and sets an httpOnly refresh cookie', async () => {
    const res = await request(app).post('/auth/register').send(alice)
    expect(res.status).toBe(201)
    expect(res.body.data.user).toMatchObject({ email: alice.email, role: 'USER' })
    expect(res.body.data.user.password).toBeUndefined()
    expect(res.body.data.accessToken).toEqual(expect.any(String))
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=.+HttpOnly/)
    const stored = await prisma.user.findUnique({ where: { email: alice.email } })
    expect(stored.password).toMatch(/^\$2[aby]\$/)
  })

  test('rejects a duplicate email with 409', async () => {
    await request(app).post('/auth/register').send(alice)
    const res = await request(app).post('/auth/register').send({ ...alice, name: 'Alice Two' })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })
})

describe('POST /auth/login', () => {
  beforeEach(() => request(app).post('/auth/register').send(alice))

  test('returns an access token for the right password', async () => {
    const res = await request(app).post('/auth/login').send({ email: alice.email, password: PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toEqual(expect.any(String))
  })

  test('returns 401 for a wrong password', async () => {
    const res = await request(app).post('/auth/login').send({ email: alice.email, password: 'Wrong12345' })
    expect(res.status).toBe(401)
    expect(res.body.data).toBeUndefined()
  })
})

describe('GET /auth/me', () => {
  test('returns the current user with a token and 401 without', async () => {
    const { body } = await request(app).post('/auth/register').send(alice)
    const ok = await request(app).get('/auth/me').set(auth({ token: body.data.accessToken }))
    expect(ok.status).toBe(200)
    expect(ok.body.data.email).toBe(alice.email)
    const anonymous = await request(app).get('/auth/me')
    expect(anonymous.status).toBe(401)
  })
})

describe('refresh and logout', () => {
  test('refresh issues a new access token from the cookie, logout revokes it', async () => {
    const agent = request.agent(app)
    await agent.post('/auth/register').send(alice)
    const refreshed = await agent.post('/auth/refresh')
    expect(refreshed.status).toBe(200)
    expect(refreshed.body.data.accessToken).toEqual(expect.any(String))
    const oldCookie = refreshed.headers['set-cookie'][0].split(';')[0]
    expect((await agent.post('/auth/logout')).status).toBe(204)
    const afterLogout = await request(app).post('/auth/refresh').set('Cookie', oldCookie)
    expect(afterLogout.status).toBe(401)
  })
})
