export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <h1 className="text-xl font-semibold text-black sm:text-2xl">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-500">
        {description || 'This section is coming soon.'}
      </p>
    </div>
  )
}
