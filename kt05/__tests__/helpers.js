const bcrypt = require('bcryptjs')
const request = require('supertest')
const app = require('../src/app')
const prisma = require('../src/db')
const { signAccess } = require('../src/utils/jwt')

const PASSWORD = 'Password123'

async function reset() {
  await prisma.$executeRawUnsafe('TRUNCATE "User", "Post", "Tag", "_PostToTag", "Message" RESTART IDENTITY CASCADE')
}

async function createUser(name, role = 'USER') {
  const user = await prisma.user.create({ data: { email: `${name.toLowerCase()}@test.dev`, name, role, password: await bcrypt.hash(PASSWORD, 4) } })
  return { ...user, token: signAccess(user) }
}

function auth(user) {
  return { Authorization: `Bearer ${user.token}` }
}

module.exports = { app, prisma, request, reset, createUser, auth, PASSWORD }
