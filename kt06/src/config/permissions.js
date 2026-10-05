const PERMISSIONS = {
  USER: ['comments:create', 'comments:update:own', 'comments:delete:own', 'posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own', 'users:read:own', 'users:update:own'],
  MODERATOR: ['comments:create', 'comments:update:own', 'comments:delete:own', 'comments:update:any', 'comments:delete:any', 'posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own', 'posts:update:any', 'posts:delete:any', 'users:list', 'users:read:any', 'users:read:own', 'users:update:own'],
  ADMIN: ['comments:create', 'comments:update:own', 'comments:delete:own', 'comments:update:any', 'comments:delete:any', 'queues:view', 'posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own', 'posts:update:any', 'posts:delete:any', 'users:list', 'users:read:any', 'users:read:own', 'users:update:own', 'users:update:any', 'users:delete', 'users:role']
}

function can(role, permission) {
  return (PERMISSIONS[role] || []).includes(permission)
}

module.exports = { PERMISSIONS, can }
