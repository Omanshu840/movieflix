const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-purple-500 mb-4"></div>
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  )
}

export default Loader
