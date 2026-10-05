const { connect, mongoose } = require('../db')
const User = require('../models/User')
const Post = require('../models/Post')

function show(label, value) {
  console.log(`\n${label}`)
  console.dir(JSON.parse(JSON.stringify(value)), { depth: 5, colors: false })
}

async function main() {
  await connect()
  await Promise.all([User.deleteMany({}), Post.deleteMany({})])
  await Promise.all([User.syncIndexes(), Post.syncIndexes()])

  const alice = await User.create({ name: 'Alice', email: 'Alice@Example.com', password: 'secret123', age: 25, role: 'admin' })
  const bob = await User.create({ name: 'Bob', email: 'bob@example.com', password: 'qwerty12', age: 31 })
  const stored = await User.findById(alice._id).select('+password').lean()
  show('CREATE: email is lower-cased, password is a bcrypt hash, not the text:', { email: stored.email, password: stored.password.slice(0, 20) + '...' })

  const withPassword = await User.findByEmail('ALICE@example.com').select('+password')
  show('Instance method checkPassword:', { right: await withPassword.checkPassword('secret123'), wrong: await withPassword.checkPassword('nope') })

  try {
    await User.create({ name: 'A', email: 'not-an-email', password: '1' })
  } catch (error) {
    show('Validation errors:', Object.values(error.errors).map((e) => `${e.path}: ${e.message}`))
  }
  try {
    await User.create({ name: 'Alice 2', email: 'alice@example.com', password: 'secret123' })
  } catch (error) {
    show('Unique index on email:', { code: error.code, message: error.message.split(' dup key')[0] })
  }

  await Post.create([
    { title: 'MongoDB for SQL people', content: 'Documents instead of rows', author: alice._id, tags: ['MongoDB', 'nosql'], published: true, views: 120 },
    { title: 'Mongoose middleware', content: 'pre and post hooks', author: alice._id, tags: ['mongoose'], published: true, views: 45 },
    { title: 'Draft: indexes', author: bob._id, tags: ['mongodb'], views: 3 }
  ])

  show('READ with filter, projection, sort:', await Post.find({ published: true, views: { $gte: 40 } }).select('title views -_id').sort({ views: -1 }).lean())
  show('READ populate author:', await Post.findOne({ title: /middleware/i }).populate('author', 'name email -_id').select('title author -_id').lean())
  show('READ virtual populate user.posts:', await User.findById(alice._id).populate({ path: 'posts', select: 'title -_id -author' }).select('name posts').lean({ virtuals: true }))
  show('READ text search "documents":', await Post.find({ $text: { $search: 'documents' } }).select('title -_id').lean())

  const updated = await Post.findOneAndUpdate(
    { title: 'Draft: indexes' },
    { $set: { published: true, title: 'Indexes in MongoDB' }, $inc: { views: 10 }, $push: { comments: { author: alice._id, text: 'Great intro!' } } },
    { returnDocument: 'after', runValidators: true }
  ).lean()
  show('UPDATE $set, $inc, $push into an embedded array:', { title: updated.title, published: updated.published, views: updated.views, comments: updated.comments.map((c) => c.text) })

  show('AGGREGATE views and posts per author:', await Post.aggregate([
    { $group: { _id: '$author', posts: { $sum: 1 }, views: { $sum: '$views' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $project: { _id: 0, author: { $first: '$user.name' }, posts: 1, views: 1 } },
    { $sort: { views: -1 } }
  ]))

  const removed = await Post.deleteMany({ author: bob._id })
  await User.deleteOne({ _id: bob._id })
  show('DELETE Bob and his posts:', { postsRemoved: removed.deletedCount, usersLeft: await User.countDocuments(), postsLeft: await Post.countDocuments() })
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
