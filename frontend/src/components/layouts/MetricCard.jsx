import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUp02Icon, ArrowDown02Icon } from '@hugeicons/core-free-icons'
import { cn } from '../../lib/utils'

const hexToRgba = (hex, opacity) => {
  if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
    return hex
  }

  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function MetricCard({ label, value, valueCompact, trend, icon, iconColor, className }) {
  const valueClass = 'min-w-0 truncate text-lg font-semibold text-black sm:text-2xl'

  const displayValue =
    valueCompact !== undefined ? (
      <>
        <span className={`${valueClass} md:hidden`}>{valueCompact}</span>
        <span className={`${valueClass} hidden md:inline`}>{value}</span>
      </>
    ) : (
      <span className={valueClass}>{value}</span>
    )

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-xl bg-white p-3 sm:gap-3 sm:rounded-2xl sm:p-5',
        className
      )}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
        style={{ backgroundColor: hexToRgba(iconColor, 0.1) }}
      >
        <HugeiconsIcon
          icon={icon}
          size={20}
          type="solid"
          className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
          style={{ color: iconColor }}
        />
      </div>

      <span className="min-w-0 truncate text-xs text-gray-500 sm:text-sm">{label}</span>

      <div className="flex min-w-0 flex-nowrap items-baseline gap-1 sm:gap-2">
        <div className="min-w-0 flex-1">{displayValue}</div>
        {trend && (
          <div
            className={`flex min-w-0 max-w-[42%] shrink-0 items-center gap-0.5 overflow-hidden rounded-full px-1 py-0.5 text-[10px] font-medium sm:max-w-[38%] sm:px-1.5 sm:text-xs ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            <HugeiconsIcon
              icon={trend.isPositive ? ArrowUp02Icon : ArrowDown02Icon}
              size={12}
              className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3"
            />
            <span className="truncate">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}
