const { app, prisma, request, reset, createUser, auth } = require('./helpers')

let owner
let stranger
let moderator
let post

beforeEach(async () => {
  await reset()
  owner = await createUser('Owner')
  stranger = await createUser('Stranger')
  moderator = await createUser('Moderator', 'MODERATOR')
  post = (await request(app).post('/api/posts').set(auth(owner)).send({ title: 'Mine', tags: ['jest'] })).body.data
})
afterAll(() => prisma.$disconnect())

describe('POST /api/posts', () => {
  test('creates a post for the token owner', async () => {
    const res = await request(app).post('/api/posts').set(auth(stranger)).send({ title: 'Hello', published: true, tags: ['jest', 'supertest'] })
    expect(res.status).toBe(201)
    expect(res.body.data.author.id).toBe(stranger.id)
    expect(res.body.data.tags.map((t) => t.name).sort()).toEqual(['jest', 'supertest'])
  })

  test('returns 401 without a token', async () => {
    const res = await request(app).post('/api/posts').send({ title: 'Anonymous' })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/posts/:id', () => {
  test('the owner deletes their own post', async () => {
    const res = await request(app).delete(`/api/posts/${post.id}`).set(auth(owner))
    expect(res.status).toBe(204)
    expect(await prisma.post.count()).toBe(0)
  })

  test('another user gets 403 and the post stays', async () => {
    const res = await request(app).delete(`/api/posts/${post.id}`).set(auth(stranger))
    expect(res.status).toBe(403)
    expect(await prisma.post.count()).toBe(1)
  })

  test('a moderator deletes any post', async () => {
    const res = await request(app).delete(`/api/posts/${post.id}`).set(auth(moderator))
    expect(res.status).toBe(204)
  })
})

describe('PATCH /api/posts/:id', () => {
  test('owner may edit, stranger may not', async () => {
    expect((await request(app).patch(`/api/posts/${post.id}`).set(auth(stranger)).send({ title: 'Hacked' })).status).toBe(403)
    const res = await request(app).patch(`/api/posts/${post.id}`).set(auth(owner)).send({ title: 'Edited', published: true })
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({ title: 'Edited', published: true })
  })
})

describe('GET /api/posts is public', () => {
  test('lists with filters and meta', async () => {
    const res = await request(app).get('/api/posts?search=MINE&page=1&limit=5')
    expect(res.status).toBe(200)
    expect(res.body.meta).toEqual({ total: 1, page: 1, limit: 5, pages: 1 })
  })
})
