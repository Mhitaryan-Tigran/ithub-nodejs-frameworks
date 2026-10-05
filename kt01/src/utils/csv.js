const fs = require('fs')
const readline = require('readline')
const { once } = require('events')

function parseLine(line) {
  return line.split(',').map((cell) => cell.trim())
}

async function* readRows(file) {
  const stream = fs.createReadStream(file, { encoding: 'utf8' })
  await once(stream, 'open')
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity })
  let header = null
  for await (const line of lines) {
    if (line.trim() === '') continue
    if (header === null) {
      header = parseLine(line)
      yield { header }
      continue
    }
    const cells = parseLine(line)
    yield { row: Object.fromEntries(header.map((key, i) => [key, cells[i]])), line }
  }
}

async function writeLines(file, lines) {
  const stream = fs.createWriteStream(file, { encoding: 'utf8' })
  for (const line of lines) {
    if (!stream.write(line + '\n')) await once(stream, 'drain')
  }
  stream.end()
  await once(stream, 'finish')
}

module.exports = { readRows, writeLines }
