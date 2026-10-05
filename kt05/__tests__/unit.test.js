const schemas = require('../src/schemas')
const { signAccess, verifyAccess, verifyRefresh } = require('../src/utils/jwt')
const { can } = require('../src/config/permissions')

describe('register schema', () => {
  test('accepts valid data and normalises the email', () => {
    const { error, value } = schemas.register.validate({ email: ' Alice@Test.DEV ', name: 'Alice', password: 'Password123' })
    expect(error).toBeUndefined()
    expect(value.email).toBe('alice@test.dev')
  })

  test('reports every invalid field at once', () => {
    const { error } = schemas.register.validate({ email: 'nope', name: 'A', password: 'short' }, { abortEarly: false })
    expect(error.details.map((d) => d.path[0]).sort()).toEqual(['email', 'name', 'password', 'password'])
  })
})

describe('jwt utils', () => {
  test('access token round-trips and carries the role', () => {
    const payload = verifyAccess(signAccess({ id: 7, role: 'MODERATOR' }))
    expect(payload).toMatchObject({ sub: 7, role: 'MODERATOR' })
  })

  test('an access token is not accepted as a refresh token', () => {
    expect(() => verifyRefresh(signAccess({ id: 7, role: 'USER' }))).toThrow()
  })
})

test('permission matrix', () => {
  expect(can('USER', 'posts:delete:any')).toBe(false)
  expect(can('MODERATOR', 'posts:delete:any')).toBe(true)
  expect(can('MODERATOR', 'users:role')).toBe(false)
  expect(can('ADMIN', 'users:role')).toBe(true)
})
