import { getDiceBearAvatarUrl } from '../../lib/avatar'
import { cn } from '../../lib/utils'

export function UserAvatar({ user, className, size = 40 }) {
  const src = getDiceBearAvatarUrl(user, { size: size * 2 })

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 rounded-full bg-gray-100 object-cover', className)}
    />
  )
}
