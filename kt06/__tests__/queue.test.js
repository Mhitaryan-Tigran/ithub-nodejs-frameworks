const added = []

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn(async (name, data, opts) => added.push({ name, data, opts })), close: jest.fn() }))
}))
jest.mock('ioredis', () => jest.fn().mockImplementation(() => ({ quit: jest.fn(), ping: jest.fn(async () => 'PONG') })))

beforeAll(() => {
  process.env.REDIS_URL = 'redis://fake:6379'
  process.env.REMINDER_DELAY_MS = '86400000'
})

test('registration queues a welcome email now and a reminder in 24 hours', async () => {
  const { enqueueWelcome } = require('../src/queues/email')
  await enqueueWelcome({ id: 7, name: 'Alice', email: 'alice@test.dev' })
  expect(added).toEqual([
    { name: 'welcome', data: { userId: 7, name: 'Alice', email: 'alice@test.dev' }, opts: { jobId: 'welcome-7' } },
    { name: 'reminder', data: { userId: 7, name: 'Alice', email: 'alice@test.dev' }, opts: { jobId: 'reminder-7', delay: 86400000 } }
  ])
})
