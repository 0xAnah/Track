const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-gray-200 shadow-xl p-8">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout;
