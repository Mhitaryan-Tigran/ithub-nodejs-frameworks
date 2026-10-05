const { Queue } = require('bullmq')
const config = require('../config')
const { redis } = require('./connection')

const NAME = 'email'
let queue = null

function emailQueue() {
  const connection = redis()
  if (!connection) return null
  queue ||= new Queue(NAME, { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 500 } })
  return queue
}

async function enqueueWelcome(user) {
  const q = emailQueue()
  if (!q) return []
  const data = { userId: user.id, name: user.name, email: user.email }
  return Promise.all([
    q.add('welcome', data, { jobId: `welcome-${user.id}` }),
    q.add('reminder', data, { jobId: `reminder-${user.id}`, delay: config.reminderDelayMs })
  ])
}

async function closeQueue() {
  if (queue) await queue.close()
  queue = null
}

module.exports = { NAME, emailQueue, enqueueWelcome, closeQueue }
