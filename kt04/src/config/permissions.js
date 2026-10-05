const PERMISSIONS = {
  USER: ['posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own', 'users:read:own', 'users:update:own'],
  MODERATOR: ['posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own', 'posts:update:any', 'posts:delete:any', 'users:list', 'users:read:any', 'users:read:own', 'users:update:own'],
  ADMIN: ['posts:read', 'posts:create', 'posts:update:own', 'posts:delete:own', 'posts:update:any', 'posts:delete:any', 'users:list', 'users:read:any', 'users:read:own', 'users:update:own', 'users:update:any', 'users:delete', 'users:role']
}

function can(role, permission) {
  return (PERMISSIONS[role] || []).includes(permission)
}

module.exports = { PERMISSIONS, can }
