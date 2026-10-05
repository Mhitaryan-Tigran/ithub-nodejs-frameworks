process.env.NODE_ENV = 'production'

const { errorHandler } = require('../src/middleware/errorHandler')

test('in production the error handler hides the stack trace', () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  jest.spyOn(console, 'error').mockImplementation(() => {})
  errorHandler(new Error('database password leaked here'), {}, res, () => {})
  expect(res.status).toHaveBeenCalledWith(500)
  const body = res.json.mock.calls[0][0]
  expect(body.error.message).toBe('Внутренняя ошибка сервера')
  expect(JSON.stringify(body)).not.toMatch(/leaked|stack|at /)
})
