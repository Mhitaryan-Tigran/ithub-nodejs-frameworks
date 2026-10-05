const $ = (selector) => document.querySelector(selector)
const state = { me: null, socket: null, room: 'general', rooms: ['general'], logs: { general: [] } }

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function renderMessages() {
  const list = $('#messages')
  list.replaceChildren(...(state.logs[state.room] || []).map((m) => {
    if (m.system) return el('li', 'system', m.system)
    const item = el('li', m.author.id === state.me.id ? 'mine' : '')
    item.append(el('div', 'who', m.author.name), el('div', 'text', m.text))
    return item
  }))
  list.scrollTop = list.scrollHeight
}

function renderRooms() {
  $('#rooms').replaceChildren(...state.rooms.map((room) => {
    const button = el('button', '', `# ${room}`)
    button.type = 'button'
    button.setAttribute('aria-current', String(room === state.room))
    button.onclick = () => {
      state.room = room
      $('#room-title').textContent = room
      renderRooms()
      renderMessages()
    }
    return el('li').appendChild(button).parentNode
  }))
}

function renderOnline(users) {
  $('#online').replaceChildren(...users.map((u) => el('li', '', u.name)))
  $('#online-count').textContent = users.length
}

function push(room, entry) {
  ;(state.logs[room] ||= []).push(entry)
  if (room === state.room) renderMessages()
}

async function login(event) {
  event.preventDefault()
  const form = new FormData(event.target)
  const res = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) })
  const body = await res.json()
  if (!res.ok) {
    $('#login-error').textContent = body.error?.message || 'Ошибка входа'
    return
  }
  state.me = body.data.user
  const history = await fetch('/api/messages', { headers: { Authorization: `Bearer ${body.data.accessToken}` } }).then((r) => r.json())
  state.logs.general = history.data || []
  connect(body.data.accessToken)
}

function connect(token) {
  const online = new Map()
  const socket = io({ auth: { token } })
  state.socket = socket

  socket.on('connect_error', (error) => {
    $('#login-error').textContent = error.message
  })
  socket.on('connect', () => {
    $('#login').hidden = true
    $('#chat').hidden = false
    $('#me').textContent = `${state.me.name} · ${state.me.role}`
    renderRooms()
    renderMessages()
  })
  socket.on('users:online', (users) => {
    users.forEach((u) => online.set(u.id, u))
    renderOnline([...online.values()])
  })
  socket.on('user:online', (user) => {
    online.set(user.id, user)
    renderOnline([...online.values()])
    push('general', { system: `${user.name} в сети` })
  })
  socket.on('user:offline', (user) => {
    online.delete(user.id)
    renderOnline([...online.values()])
    push('general', { system: `${user.name} вышел` })
  })
  socket.on('message:new', (message) => push('general', message))
  socket.on('room:message', (message) => push(message.room, message))
  socket.on('room:joined', ({ room, user }) => push(room, { system: `${user.name} вошёл в #${room}` }))
  socket.on('room:left', ({ room, user }) => push(room, { system: `${user.name} покинул #${room}` }))
}

$('#login').addEventListener('submit', login)

$('#send').addEventListener('submit', (event) => {
  event.preventDefault()
  const input = event.target.elements.text
  const text = input.value
  const done = (reply) => {
    if (reply.ok) input.value = ''
    else push(state.room, { system: reply.error })
  }
  if (state.room === 'general') state.socket.emit('message:send', { text }, done)
  else state.socket.emit('room:message', { room: state.room, text }, done)
})

$('#join').addEventListener('submit', (event) => {
  event.preventDefault()
  const input = event.target.elements.room
  state.socket.emit('room:join', { room: input.value }, (reply) => {
    if (!reply.ok) return push(state.room, { system: reply.error })
    const { room, history } = reply.data
    if (!state.rooms.includes(room)) state.rooms.push(room)
    state.logs[room] = history
    state.room = room
    $('#room-title').textContent = room
    input.value = ''
    renderRooms()
    renderMessages()
  })
})
