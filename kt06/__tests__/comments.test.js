const { app, prisma, request, reset, createUser, auth } = require('./helpers')

let author
let reader
let moderator
let post

beforeEach(async () => {
  await reset()
  author = await createUser('Author')
  reader = await createUser('Reader')
  moderator = await createUser('Moderator', 'MODERATOR')
  post = await prisma.post.create({ data: { title: 'Commented', published: true, authorId: author.id } })
})
afterAll(() => prisma.$disconnect())

test('anyone reads comments of a post with pagination meta', async () => {
  await prisma.comment.createMany({ data: [1, 2, 3].map((n) => ({ text: `c${n}`, postId: post.id, authorId: reader.id })) })
  const res = await request(app).get(`/api/posts/${post.id}/comments?limit=2`)
  expect(res.status).toBe(200)
  expect(res.body.data.map((c) => c.text)).toEqual(['c1', 'c2'])
  expect(res.body.meta).toEqual({ total: 3, page: 1, limit: 2, pages: 2 })
})

test('commenting needs a token and an existing post', async () => {
  expect((await request(app).post(`/api/posts/${post.id}/comments`).send({ text: 'hi' })).status).toBe(401)
  expect((await request(app).post('/api/posts/9999/comments').set(auth(reader)).send({ text: 'hi' })).status).toBe(404)
  expect((await request(app).post(`/api/posts/${post.id}/comments`).set(auth(reader)).send({ text: '   ' })).status).toBe(400)
  const res = await request(app).post(`/api/posts/${post.id}/comments`).set(auth(reader)).send({ text: 'Nice post' })
  expect(res.status).toBe(201)
  expect(res.body.data).toMatchObject({ text: 'Nice post', author: { id: reader.id } })
})

test('only the comment author or a moderator may change it', async () => {
  const comment = await prisma.comment.create({ data: { text: 'mine', postId: post.id, authorId: reader.id } })
  expect((await request(app).patch(`/api/comments/${comment.id}`).set(auth(author)).send({ text: 'edited by post author' })).status).toBe(403)
  expect((await request(app).patch(`/api/comments/${comment.id}`).set(auth(reader)).send({ text: 'edited' })).body.data.text).toBe('edited')
  expect((await request(app).delete(`/api/comments/${comment.id}`).set(auth(moderator))).status).toBe(204)
  expect(await prisma.comment.count()).toBe(0)
})

test('deleting a post removes its comments', async () => {
  await prisma.comment.create({ data: { text: 'x', postId: post.id, authorId: reader.id } })
  expect((await request(app).delete(`/api/posts/${post.id}`).set(auth(author))).status).toBe(204)
  expect(await prisma.comment.count()).toBe(0)
})
