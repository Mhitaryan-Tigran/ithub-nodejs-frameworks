require('dotenv').config({ quiet: true })
const _ = require('lodash')
const { add, multiply, average } = require('./utils/math')

const appName = process.env.APP_NAME
const port = process.env.PORT

console.log(`${appName} запущен на порту ${port}`)

console.log(`2 + 3 = ${add(2, 3)}`)
console.log(`4 * 5 = ${multiply(4, 5)}`)
console.log(`Среднее [1,2,3,4,5] = ${average([1, 2, 3, 4, 5])}`)

const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 }
]

const grouped = _.groupBy(users, 'age')
console.log('Сгруппировано по возрасту:', grouped)

const sorted = _.sortBy(users, 'name')
console.log('Отсортировано по имени:', sorted)
