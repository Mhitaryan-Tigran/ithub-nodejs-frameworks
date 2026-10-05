module.exports = async function globalTeardown() {
  await globalThis.__PG__?.stop()
}
