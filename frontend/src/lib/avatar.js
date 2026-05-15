export function getDiceBearAvatarUrl(user, options = {}) {
  const seed = user?.email || user?.username || 'default'
  const size = options.size || 80
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=${size}`
}
