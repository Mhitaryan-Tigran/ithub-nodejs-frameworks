const fs = require('fs')
const { performance } = require('perf_hooks')

console.log('=== Демонстрация Event Loop ===\n')

console.log('[1] Синхронный код — начало')

setTimeout(() => console.log('[5] setTimeout 0ms'), 0)
setTimeout(() => console.log('[6] setTimeout 100ms'), 100)

Promise.resolve()
  .then(() => console.log('[3] Promise.then'))
  .then(() => console.log('[4] Promise.then chained'))

process.nextTick(() => console.log('[2] process.nextTick'))

console.log('[1] Синхронный код — конец')

console.log('\n[async] Начало чтения файла...')
const start = performance.now()

fs.readFile(__filename, 'utf8', (err, data) => {
  const end = performance.now()
  console.log(`[async] Файл прочитан за ${(end - start).toFixed(2)}ms`)
  console.log(`[async] Размер файла: ${data.length} символов`)
})

console.log('[async] Этот код выполнился ДО чтения файла')
