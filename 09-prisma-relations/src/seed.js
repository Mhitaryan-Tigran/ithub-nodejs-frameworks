const prisma = require('./db')

const CATALOG = {
  electronics: [['Smartphone Pixel', 699, 12], ['Phone case', 19, 140], ['Headphones', 249, 0], ['Laptop Air', 1199, 5], ['USB-C charger', 29, 60], ['Smartwatch', 329, 8]],
  books: [['Clean Code', 35, 20], ['Node.js Design Patterns', 45, 0], ['The Pragmatic Programmer', 40, 7]],
  home: [['Desk lamp', 59, 15], ['Phone stand', 15, 33], ['Office chair', 349, 2]]
}

async function main() {
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  for (const [category, items] of Object.entries(CATALOG)) {
    await prisma.category.create({ data: { name: category, products: { create: items.map(([name, price, stock]) => ({ name, price, stock })) } } })
  }
  console.log(`Seeded ${await prisma.product.count()} products in ${await prisma.category.count()} categories`)
}

main().finally(() => prisma.$disconnect())
