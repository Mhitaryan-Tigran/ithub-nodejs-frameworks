const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function show(label, value) {
  console.log(`\n${label}`)
  console.dir(value, { depth: 4, colors: false })
}

async function main() {
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      posts: {
        create: [
          { title: 'Hello Prisma', content: 'First post', published: true, tags: { connectOrCreate: [{ where: { name: 'prisma' }, create: { name: 'prisma' } }] } },
          { title: 'Draft about SQLite', tags: { connectOrCreate: [{ where: { name: 'sqlite' }, create: { name: 'sqlite' } }] } }
        ]
      }
    },
    include: { posts: { include: { tags: true } } }
  })
  show('CREATE user with two posts and tags (nested write):', alice)

  const bob = await prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob' } })
  await prisma.post.create({ data: { title: 'Node.js streams', published: true, authorId: bob.id, tags: { connect: [{ name: 'prisma' }] } } })

  show('READ all users with post counts:', await prisma.user.findMany({ select: { id: true, name: true, _count: { select: { posts: true } } }, orderBy: { id: 'asc' } }))
  show('READ published posts with author name:', await prisma.post.findMany({ where: { published: true }, select: { title: true, author: { select: { name: true } } } }))
  show('READ one user by unique email:', await prisma.user.findUnique({ where: { email: 'bob@example.com' } }))
  show('READ posts tagged "prisma":', await prisma.post.findMany({ where: { tags: { some: { name: 'prisma' } } }, select: { title: true } }))

  const draft = await prisma.post.findFirst({ where: { published: false } })
  show('UPDATE publish the draft:', await prisma.post.update({ where: { id: draft.id }, data: { published: true, content: 'Now published' } }))
  show('UPDATE many: users whose name starts with B:', await prisma.user.updateMany({ where: { name: { startsWith: 'B' } }, data: { name: 'BOB' } }))

  show('DELETE Bob (his posts are removed by onDelete: Cascade):', await prisma.user.delete({ where: { email: 'bob@example.com' } }))
  show('Remaining posts:', await prisma.post.count())

  const missing = await prisma.user.findUnique({ where: { id: 999 } })
  show('READ missing user returns null:', missing)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
