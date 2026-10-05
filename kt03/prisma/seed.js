const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$executeRawUnsafe('ALTER SEQUENCE "User_id_seq" RESTART WITH 1')
  await prisma.$executeRawUnsafe('ALTER SEQUENCE "Post_id_seq" RESTART WITH 1')
  await prisma.$executeRawUnsafe('ALTER SEQUENCE "Tag_id_seq" RESTART WITH 1')
  const posts = [
    ['Getting started with Prisma', true, ['prisma', 'orm']],
    ['PostgreSQL indexes in practice', true, ['postgres', 'sql']],
    ['Draft: Express error handling', false, ['express']],
    ['Why I like PRISMA migrations', true, ['prisma']],
    ['Notes on REST pagination', false, ['rest', 'api']]
  ]
  const alice = await prisma.user.create({ data: { email: 'alice@example.com', name: 'Alice', role: 'ADMIN' } })
  const bob = await prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob' } })
  for (const [i, [title, published, tags]] of posts.entries()) {
    await prisma.post.create({
      data: { title, published, content: `${title}. Body text.`, authorId: i % 2 ? bob.id : alice.id, createdAt: new Date(Date.UTC(2026, 8, 1 + i)), tags: { connectOrCreate: tags.map((name) => ({ where: { name }, create: { name } })) } }
    })
  }
  console.log(`Seeded ${await prisma.user.count()} users, ${await prisma.post.count()} posts, ${await prisma.tag.count()} tags`)
}

main().finally(() => prisma.$disconnect())
