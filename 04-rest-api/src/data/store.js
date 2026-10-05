const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 31 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 22 },
  { id: 4, name: 'Eve', email: 'eve@example.com', age: 28 },
  { id: 5, name: 'Frank', email: 'frank@example.com', age: 35 },
  { id: 6, name: 'Grace', email: 'grace@example.com', age: 27 },
  { id: 7, name: 'Heidi', email: 'heidi@example.com', age: 19 }
]

const orders = [
  { id: 101, userId: 2, product: 'Laptop', total: 1200, status: 'delivered' },
  { id: 102, userId: 2, product: 'Mouse', total: 25, status: 'shipped' },
  { id: 103, userId: 3, product: 'Monitor', total: 300, status: 'new' }
]

module.exports = { users, orders, nextId: () => Math.max(0, ...users.map((u) => u.id)) + 1 }
