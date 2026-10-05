const path = require('path')
const swaggerJsdoc = require('swagger-jsdoc')
const { version } = require('../../package.json')

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Blog API', version, description: 'Blog platform: JWT auth, RBAC, posts with tags, realtime chat.' },
    servers: [{ url: '/' }],
    tags: [{ name: 'Auth' }, { name: 'Posts' }, { name: 'Users' }, { name: 'Comments' }, { name: 'Admin' }, { name: 'Chat' }, { name: 'System' }]
  },
  apis: [path.join(__dirname, '../docs/*.yaml')]
})
