import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome,
  FiPlay,
  FiSearch,
  FiBookmark,
  FiTrendingUp,
  FiUser,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi'

const Sidebar = () => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const mainLinks = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/movies', icon: FiPlay, label: 'Movies' },
    { path: '/tv-shows', icon: FiTrendingUp, label: 'TV Shows' },
    { path: '/my-list', icon: FiBookmark, label: 'My List' },
  ]

  const bottomLinks = [
    { path: '/search', icon: FiSearch, label: 'Search' }
  ]

  return (
    <div className="fixed left-0 top-0 h-screen w-15 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-r border-purple-500/20 flex flex-col items-center py-8 z-40">
      

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-6 mt-8">
        {mainLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10 relative group ${
                active
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-purple-400'
              }`}
              title={link.label}
            >
              <Icon className="w-10 h-10" />
              {/* Tooltip */}
              <div className="absolute left-full ml-4 bg-slate-800 text-white rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {link.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col gap-4 mt-auto">
        {bottomLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className="p-3 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10 text-gray-400 hover:bg-slate-800 hover:text-purple-400 relative group"
              title={link.label}
            >
              <Icon className="w-6 h-6" />
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {link.label}
              </div>
            </Link>
          )
        })}


        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="p-3 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10 text-gray-400 hover:bg-red-500/20 hover:text-red-400 relative group"
          title="Sign Out"
        >
          <FiLogOut className="w-6 h-6" />
          {/* Tooltip */}
          <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Sign Out
          </div>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
