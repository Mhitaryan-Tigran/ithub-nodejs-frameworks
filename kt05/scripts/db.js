const path = require('path')
const EmbeddedPostgres = require('embedded-postgres').default

const port = Number(process.env.PG_PORT || 5432)
const database = process.env.PG_DATABASE || 'blog'

async function main() {
  const pg = new EmbeddedPostgres({ databaseDir: path.join(__dirname, '../.pgdata', String(port)), user: 'postgres', password: 'postgres', port, persistent: true, onLog: () => {} })
  const fresh = !require('fs').existsSync(path.join(__dirname, '../.pgdata', String(port), 'PG_VERSION'))
  if (fresh) await pg.initialise()
  await pg.start()
  await pg.createDatabase(database).catch(() => {})
  console.log(`PostgreSQL is running: postgresql://postgres:postgres@localhost:${port}/${database}`)
  const stop = async () => {
    await pg.stop()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
