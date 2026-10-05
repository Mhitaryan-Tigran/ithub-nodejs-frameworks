const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true })

const root = path.join(__dirname, '../..')

function required(name) {
  const value = process.env[name]
  if (value === undefined || value === '') {
    throw new Error(`Переменная окружения ${name} не задана, см. .env.example`)
  }
  return value
}

function toNumber(name) {
  const value = Number(required(name))
  if (!Number.isFinite(value)) {
    throw new Error(`Переменная окружения ${name} должна быть числом`)
  }
  return value
}

module.exports = {
  inputFile: path.resolve(root, required('INPUT_FILE')),
  outputFile: path.resolve(root, required('OUTPUT_FILE')),
  minAge: toNumber('MIN_AGE'),
  cityFilter: required('CITY_FILTER')
}
