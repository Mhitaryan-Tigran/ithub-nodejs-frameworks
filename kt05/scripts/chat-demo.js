const { io } = require('socket.io-client')

const base = process.env.BASE_URL || 'http://localhost:3000'
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function login(email) {
  const res = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Password123' }) })
  return (await res.json()).data
}

function join(name, token) {
  const socket = io(base, { auth: { token }, transports: ['websocket'] })
  for (const event of ['users:online', 'user:online', 'user:offline', 'message:new', 'room:message', 'room:joined', 'room:left']) {
    socket.on(event, (payload) => {
      const view = Array.isArray(payload) ? payload.map((u) => u.name) : payload.text ? `${payload.author.name} in #${payload.room}: ${payload.text}` : payload.user ? `${payload.user.name} → #${payload.room}` : payload.name
      console.log(`  [${name}] ← ${event}: ${JSON.stringify(view)}`)
    })
  }
  socket.on('connect_error', (error) => console.log(`  [${name}] ← connect_error: ${error.message}`))
  return socket
}

function send(socket, name, event, payload) {
  return new Promise((resolve) => socket.emit(event, payload, (reply) => {
    console.log(`  [${name}] → ${event} ${JSON.stringify(payload)} ack ${reply.ok ? 'ok' : 'error: ' + reply.error}`)
    resolve(reply)
  }))
}

async function main() {
  console.log('1. No token')
  const anonymous = join('anonymous', undefined)
  await wait(300)
  anonymous.close()
  const alice = await login('alice@example.com')
  const bob = await login('bob@example.com')
  console.log('2. Alice connects')
  const a = join('Alice', alice.accessToken)
  await wait(300)
  console.log('3. Bob connects')
  const b = join('Bob', bob.accessToken)
  await wait(300)
  console.log('4. Global chat')
  await send(a, 'Alice', 'message:send', { text: 'Всем привет!' })
  await wait(200)
  console.log('5. Rooms')
  await send(a, 'Alice', 'room:message', { room: 'backend', text: 'не в комнате' })
  await send(a, 'Alice', 'room:join', { room: 'backend' })
  await send(b, 'Bob', 'room:join', { room: 'backend' })
  await send(b, 'Bob', 'room:message', { room: 'backend', text: 'Кто деплоит сегодня?' })
  await wait(200)
  await send(b, 'Bob', 'room:leave', { room: 'backend' })
  await wait(200)
  console.log('6. Bob disconnects')
  b.close()
  await wait(300)
  a.close()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
