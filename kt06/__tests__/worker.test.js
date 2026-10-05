const { prisma, reset, createUser } = require('./helpers')
const { processEmail } = require('../src/workers/email')

beforeEach(reset)
afterAll(() => prisma.$disconnect())

test('the worker builds the welcome and reminder emails from the database', async () => {
  const user = await createUser('Alice')
  const log = jest.spyOn(console, 'log').mockImplementation(() => {})
  const welcome = await processEmail({ id: '1', name: 'welcome', data: { userId: user.id } })
  expect(welcome).toEqual({ to: user.email, subject: 'Добро пожаловать, Alice!' })
  await prisma.post.create({ data: { title: 'p', authorId: user.id } })
  const reminder = await processEmail({ id: '2', name: 'reminder', data: { userId: user.id } })
  expect(reminder.subject).toBe('Alice, как вам блог?')
  expect(log.mock.calls.map((c) => c[0]).join('\n')).toMatch(/welcome → Alice <alice@test.dev>/)
  expect(await processEmail({ id: '3', name: 'welcome', data: { userId: 999 } })).toEqual({ skipped: 'user deleted' })
  log.mockRestore()
})
