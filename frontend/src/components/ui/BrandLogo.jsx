import { cn } from '../../lib/utils'

/** collapsed: favicon only · expanded: logo.png wordmark only */
export function BrandLogo({ collapsed = false, className, iconClassName }) {
  if (collapsed) {
    return (
      <img
        src="/favicon.svg"
        alt="Track"
        className={cn('h-9 w-9 shrink-0 object-contain', iconClassName, className)}
      />
    )
  }

  return (
    <img
      src="/logo.png"
      alt="Track"
      className={cn('h-7 w-auto shrink-0 object-contain', className)}
    />
  )
}
