const path = require('path')
const { execSync } = require('child_process')
const EmbeddedPostgres = require('embedded-postgres').default

module.exports = async function globalSetup() {
  require('./env')
  const pg = new EmbeddedPostgres({ databaseDir: path.join(__dirname, '../.pgdata/test'), user: 'postgres', password: 'postgres', port: 5434, persistent: false, onLog: () => {} })
  await pg.initialise()
  await pg.start()
  await pg.createDatabase('blog_test')
  execSync('npx prisma migrate deploy', { cwd: path.join(__dirname, '..'), env: process.env, stdio: 'ignore' })
  globalThis.__PG__ = pg
}
