const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const USERS = [
  ['admin@example.com', 'Admin', 'ADMIN'],
  ['moderator@example.com', 'Moderator', 'MODERATOR'],
  ['alice@example.com', 'Alice', 'USER'],
  ['bob@example.com', 'Bob', 'USER']
]

const POSTS = [
  ['Getting started with Prisma', true, ['prisma', 'orm'], 'alice@example.com'],
  ['PostgreSQL indexes in practice', true, ['postgres', 'sql'], 'bob@example.com'],
  ['Draft: Express error handling', false, ['express'], 'alice@example.com'],
  ['Why I like PRISMA migrations', true, ['prisma'], 'bob@example.com'],
  ['Moderation rules', true, ['meta'], 'moderator@example.com']
]

async function main() {
  if (process.env.SEED_IF_EMPTY === 'true' && (await prisma.post.count()) > 0) {
    console.log('Database already has posts, demo seed skipped')
    return
  }
  await prisma.$executeRawUnsafe('TRUNCATE "User", "Post", "Tag", "_PostToTag", "Message", "Comment" RESTART IDENTITY CASCADE')
  const password = await bcrypt.hash('Password123', 10)
  const ids = {}
  for (const [email, name, role] of USERS) {
    ids[email] = (await prisma.user.create({ data: { email, name, role, password } })).id
  }
  for (const [i, [title, published, tags, author]] of POSTS.entries()) {
    await prisma.post.create({
      data: { title, published, content: `${title}. Body text.`, authorId: ids[author], createdAt: new Date(Date.UTC(2026, 8, 1 + i)), tags: { connectOrCreate: tags.map((name) => ({ where: { name }, create: { name } })) } }
    })
  }
  const comments = [[1, 'bob@example.com', 'Thanks, very clear intro'], [1, 'moderator@example.com', 'Pinned for newcomers'], [2, 'alice@example.com', 'Partial indexes next?']]
  for (const [postId, email, text] of comments) {
    await prisma.comment.create({ data: { postId, text, authorId: ids[email] } })
  }
  console.log(`Seeded ${USERS.length} users (password Password123), ${POSTS.length} posts, ${comments.length} comments`)
}

main().finally(() => prisma.$disconnect())
