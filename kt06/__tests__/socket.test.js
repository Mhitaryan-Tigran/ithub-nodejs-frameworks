const http = require('http')
const { io: connect } = require('socket.io-client')
const { app, prisma, request, reset, createUser, auth } = require('./helpers')
const { attachSocket } = require('../src/realtime/socket')

let server
let io
let url
let alice
let bob
const clients = []

function client(user) {
  const socket = connect(url, { auth: user ? { token: user.token } : {}, transports: ['websocket'], reconnection: false, forceNew: true })
  clients.push(socket)
  return socket
}

function next(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve))
}

function emit(socket, event, payload) {
  return new Promise((resolve) => socket.emit(event, payload, resolve))
}

beforeAll(async () => {
  server = http.createServer(app)
  io = attachSocket(server)
  await new Promise((resolve) => server.listen(0, resolve))
  url = `http://localhost:${server.address().port}`
})

beforeEach(async () => {
  await reset()
  alice = await createUser('Alice')
  bob = await createUser('Bob')
})

afterEach(() => {
  clients.splice(0).forEach((s) => s.disconnect())
})

afterAll(async () => {
  io.close()
  await new Promise((resolve) => server.close(resolve))
  await prisma.$disconnect()
})

test('a connection without a token is rejected by the JWT middleware', async () => {
  const error = await next(client(null), 'connect_error')
  expect(error.message).toMatch(/access token/)
  const forged = await next(client({ token: 'not-a-jwt' }), 'connect_error')
  expect(forged.message).toBe('Недействительный access token')
})

test('a new user receives the online list, others get user:online and later user:offline', async () => {
  const a = client(alice)
  const list = await next(a, 'users:online')
  expect(list.map((u) => u.name)).toEqual(['Alice'])
  const seen = next(a, 'user:online')
  const b = client(bob)
  const bobList = await next(b, 'users:online')
  expect(bobList.map((u) => u.name).sort()).toEqual(['Alice', 'Bob'])
  expect((await seen).name).toBe('Bob')
  const gone = next(a, 'user:offline')
  b.disconnect()
  expect((await gone).name).toBe('Bob')
})

test('message:send is broadcast as message:new and stored in the database', async () => {
  const a = client(alice)
  const b = client(bob)
  await Promise.all([next(a, 'users:online'), next(b, 'users:online')])
  const received = next(b, 'message:new')
  const reply = await emit(a, 'message:send', { text: '  Привет!  ' })
  expect(reply.ok).toBe(true)
  const message = await received
  expect(message).toMatchObject({ text: 'Привет!', room: 'general', author: { name: 'Alice' } })
  expect(await prisma.message.count()).toBe(1)
  expect((await emit(a, 'message:send', { text: '   ' })).ok).toBe(false)
})

test('room messages reach only room members, history comes on join', async () => {
  const a = client(alice)
  const b = client(bob)
  await Promise.all([next(a, 'users:online'), next(b, 'users:online')])
  expect((await emit(a, 'room:message', { room: 'backend', text: 'nope' })).error).toMatch(/Сначала войдите/)
  await emit(a, 'room:join', { room: 'backend' })
  const outsider = jest.fn()
  b.on('room:message', outsider)
  const own = next(a, 'room:message')
  await emit(a, 'room:message', { room: 'backend', text: 'Only for backend' })
  expect((await own).text).toBe('Only for backend')
  const joined = await emit(b, 'room:join', { room: 'backend' })
  expect(joined.data.history.map((m) => m.text)).toEqual(['Only for backend'])
  expect(outsider).not.toHaveBeenCalled()
  const left = await emit(b, 'room:leave', { room: 'backend' })
  expect(left.ok).toBe(true)
  expect((await emit(a, 'room:join', { room: 'Bad Name!' })).ok).toBe(false)
})

test('chat history is available over REST for authenticated users', async () => {
  await prisma.message.create({ data: { text: 'stored', authorId: alice.id } })
  expect((await request(app).get('/api/messages')).status).toBe(401)
  const res = await request(app).get('/api/messages?room=general').set(auth(bob))
  expect(res.status).toBe(200)
  expect(res.body.data[0]).toMatchObject({ text: 'stored', author: { name: 'Alice' } })
})

test('Swagger UI and the OpenAPI document are served', async () => {
  const spec = await request(app).get('/api/docs.json')
  expect(spec.status).toBe(200)
  expect(Object.keys(spec.body.paths)).toEqual(expect.arrayContaining(['/auth/register', '/auth/login', '/api/posts', '/api/posts/{id}']))
  expect(Object.keys(spec.body.components.schemas)).toEqual(expect.arrayContaining(['User', 'Post', 'Error']))
  const ui = await request(app).get('/api/docs/')
  expect(ui.status).toBe(200)
  expect(ui.text).toMatch(/swagger-ui/)
})
