import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX } from 'react-icons/fi'

const Header = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <header className="fixed top-0 right-0 left-24 z-50">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1" />

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, shows..."
                className="bg-slate-800/50 border border-purple-500/30 text-white px-4 py-2 pr-10 rounded-full focus:outline-none focus:border-purple-500 transition-colors w-64"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-slate-800/50 rounded-full"
              aria-label="Search"
            >
              <FiSearch className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
