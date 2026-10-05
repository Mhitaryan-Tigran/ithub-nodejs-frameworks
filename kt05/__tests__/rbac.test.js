const { app, prisma, request, reset, createUser, auth } = require('./helpers')

let user
let moderator
let admin

beforeEach(async () => {
  await reset()
  user = await createUser('User')
  moderator = await createUser('Moderator', 'MODERATOR')
  admin = await createUser('Admin', 'ADMIN')
})
afterAll(() => prisma.$disconnect())

test('GET /api/users: USER 403, MODERATOR and ADMIN 200', async () => {
  expect((await request(app).get('/api/users').set(auth(user))).status).toBe(403)
  expect((await request(app).get('/api/users').set(auth(moderator))).status).toBe(200)
  const res = await request(app).get('/api/users').set(auth(admin))
  expect(res.status).toBe(200)
  expect(res.body.meta.total).toBe(3)
  expect(res.body.data[0].password).toBeUndefined()
})

test('PATCH /admin/users/:id/role: only ADMIN', async () => {
  expect((await request(app).patch(`/admin/users/${user.id}/role`).set(auth(moderator)).send({ role: 'ADMIN' })).status).toBe(403)
  const res = await request(app).patch(`/api/admin/users/${user.id}/role`).set(auth(admin)).send({ role: 'MODERATOR' })
  expect(res.status).toBe(200)
  expect(res.body.data.role).toBe('MODERATOR')
})

test('a user reads their own profile but not someone else\'s', async () => {
  expect((await request(app).get(`/api/users/${user.id}`).set(auth(user))).status).toBe(200)
  expect((await request(app).get(`/api/users/${admin.id}`).set(auth(user))).status).toBe(403)
})
