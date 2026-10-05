const prisma = require('./db')

function show(label, value) {
  console.log(`\n${label}`)
  console.dir(value, { depth: 5, colors: false })
}

async function main() {
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      profile: { create: { bio: 'Backend developer', city: 'Moscow' } },
      posts: {
        create: [
          { title: 'Relations in Prisma', published: true, tags: { create: [{ name: 'prisma' }, { name: 'orm' }] } },
          { title: 'Migrations without fear', tags: { connect: [{ name: 'prisma' }] } }
        ]
      }
    }
  })
  const bob = await prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob', profile: { create: { city: 'Kazan' } } } })
  await prisma.post.create({ data: { title: 'SQL joins explained', published: true, author: { connect: { id: bob.id } }, tags: { connectOrCreate: [{ where: { name: 'sql' }, create: { name: 'sql' } }, { where: { name: 'orm' }, create: { name: 'orm' } }] } } })

  show('1:1 and 1:N — user with profile and posts (include):', await prisma.user.findUnique({ where: { id: alice.id }, include: { profile: true, posts: { select: { title: true, published: true } } } }))
  show('M:N — tags with their posts:', await prisma.tag.findMany({ orderBy: { name: 'asc' }, include: { posts: { select: { title: true } } } }))
  show('Reverse side — post with author and tags:', await prisma.post.findFirst({ where: { title: 'SQL joins explained' }, select: { title: true, author: { select: { name: true, profile: { select: { city: true } } } }, tags: { select: { name: true } } } }))

  const post = await prisma.post.findFirst({ where: { title: 'Relations in Prisma' } })
  await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 3 } } })
  show('viewCount from migration add_view_count, incremented by 3:', await prisma.post.findUnique({ where: { id: post.id }, select: { title: true, viewCount: true } }))

  await prisma.post.update({ where: { id: post.id }, data: { tags: { disconnect: [{ name: 'orm' }], connect: [{ name: 'sql' }] } } })
  show('Changing M:N links (disconnect orm, connect sql):', await prisma.post.findUnique({ where: { id: post.id }, select: { title: true, tags: { select: { name: true } } } }))

  show('Relation filters — users with at least one published post tagged sql:', await prisma.user.findMany({ where: { posts: { some: { published: true, tags: { some: { name: 'sql' } } } } }, select: { name: true } }))
  show('Relation filters — users without drafts:', await prisma.user.findMany({ where: { posts: { none: { published: false } } }, select: { name: true } }))
  show('Counting relations:', await prisma.user.findMany({ select: { name: true, _count: { select: { posts: true } } } }))

  await prisma.user.delete({ where: { id: alice.id } })
  show('After deleting Alice — cascade removed her profile and posts, tags stay:', {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    posts: await prisma.post.count(),
    tags: await prisma.tag.count()
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
