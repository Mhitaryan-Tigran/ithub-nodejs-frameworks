const { Worker } = require('bullmq')
const prisma = require('../db')
const { redis } = require('../queues/connection')
const { NAME } = require('../queues/email')

const TEMPLATES = {
  welcome: (u) => ({ subject: `Добро пожаловать, ${u.name}!`, text: 'Ваш аккаунт в блоге создан. Напишите первый пост.' }),
  reminder: (u, posts) => ({ subject: `${u.name}, как вам блог?`, text: posts ? `У вас уже ${posts} пост(ов), спасибо!` : 'Вы ещё не опубликовали ни одного поста — самое время.' })
}

async function processEmail(job) {
  const user = await prisma.user.findUnique({ where: { id: job.data.userId }, select: { id: true, name: true, email: true, _count: { select: { posts: true } } } })
  if (!user) return { skipped: 'user deleted' }
  const mail = TEMPLATES[job.name](user, user._count.posts)
  console.log(`[email] ${job.name} → ${user.name} <${user.email}>: «${mail.subject}» (job ${job.id})`)
  return { to: user.email, subject: mail.subject }
}

function createEmailWorker() {
  const connection = redis()
  if (!connection) throw new Error('REDIS_URL is required for the email worker')
  const worker = new Worker(NAME, processEmail, { connection, concurrency: 5 })
  worker.on('failed', (job, error) => console.error(`[email] job ${job?.id} failed: ${error.message}`))
  return worker
}

module.exports = { createEmailWorker, processEmail }
