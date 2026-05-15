const RoleCard = ({ title, description, icon, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        border rounded-2xl p-6 cursor-pointer transition-all duration-300
        hover:border-blue-500 hover:shadow-md
        ${active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}
      `}
    >
      <div className='mb-4'>
        {icon}
      </div>

      <h3 className='text-lg font-semibold mb-2'>
        {title}
      </h3>

      <p className='text-sm text-gray-500 leading-relaxed'>
        {description}
      </p>
    </div>
  )
}

export default RoleCard