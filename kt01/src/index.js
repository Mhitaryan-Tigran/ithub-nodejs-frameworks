const fs = require('fs/promises')

async function main() {
  const config = require('./config')
  const { readRows, writeLines } = require('./utils/csv')

  try {
    await fs.access(config.inputFile)
  } catch {
    throw new Error(`Входной файл не найден: ${config.inputFile}`)
  }

  const output = []
  let processed = 0
  for await (const { header, row, line } of readRows(config.inputFile)) {
    if (header) {
      output.push(header.join(','))
      continue
    }
    processed += 1
    if (Number(row.age) >= config.minAge && row.city === config.cityFilter) {
      output.push(line)
    }
  }

  await writeLines(config.outputFile, output)
  const passed = output.length - 1
  console.log(`Фильтр: возраст >= ${config.minAge}, город = ${config.cityFilter}`)
  console.log(`Обработано строк: ${processed}`)
  console.log(`Прошли фильтр: ${passed}`)
  console.log(`Отброшено: ${processed - passed}`)
  console.log(`Результат записан в ${config.outputFile}`)
}

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`)
  process.exitCode = 1
})
