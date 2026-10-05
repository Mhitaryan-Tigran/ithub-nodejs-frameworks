const prisma = require('./db')

const SORT_FIELDS = ['price', 'name', 'createdAt', 'stock']

function toNumber(value) {
  if (value === undefined || value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

async function getCatalog(query = {}) {
  const page = Math.max(1, toNumber(query.page) || 1)
  const limit = Math.min(50, Math.max(1, toNumber(query.limit) || 10))
  const minPrice = toNumber(query.minPrice)
  const maxPrice = toNumber(query.maxPrice)
  const sortBy = SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt'
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

  const where = {}
  if (query.search) where.name = { contains: query.search }
  if (query.category) where.category = { name: query.category }
  if (minPrice !== undefined || maxPrice !== undefined) where.price = { gte: minPrice, lte: maxPrice }
  if (query.inStock === 'true') where.stock = { gt: 0 }
  if (query.inStock === 'false') where.stock = 0

  const [total, data] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: [{ [sortBy]: sortOrder }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit
    })
  ])

  return { data, meta: { total, page, limit, pages: Math.ceil(total / limit), sortBy, sortOrder } }
}

async function getStats() {
  const groups = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: { _all: true },
    _avg: { price: true },
    _min: { price: true },
    _max: { price: true },
    _sum: { stock: true },
    orderBy: { categoryId: 'asc' }
  })
  const categories = await prisma.category.findMany()
  const names = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  return groups.map((g) => ({
    category: names[g.categoryId],
    products: g._count._all,
    avgPrice: Math.round(g._avg.price * 100) / 100,
    minPrice: g._min.price,
    maxPrice: g._max.price,
    totalStock: g._sum.stock
  }))
}

module.exports = { getCatalog, getStats }
