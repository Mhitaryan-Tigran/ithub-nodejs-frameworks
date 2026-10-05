require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')

async function connect() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set, see .env.example')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
  return mongoose.connection
}

module.exports = { connect, mongoose }
