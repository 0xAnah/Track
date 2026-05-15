export function PageHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h1 className="text-lg font-medium text-black sm:text-xl">{title}</h1>
      {action}
    </div>
  )
}
