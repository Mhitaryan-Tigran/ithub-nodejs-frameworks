function add(a, b) {
  return a + b
}

function multiply(a, b) {
  return a * b
}

function average(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

module.exports = { add, multiply, average }
