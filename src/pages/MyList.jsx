import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { getDetails } from '../services/tmdbApi'
import MovieCard from '../components/home/MovieCard'
import Loader from '../components/common/Loader'
import { FiFilm, FiTv, FiHeart, FiPlay, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const MyList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [contentDetails, setContentDetails] = useState([])
  const [fetchingDetails, setFetchingDetails] = useState(false)

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'movie', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' },
  ]

  useEffect(() => {
    fetchWatchlist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (watchlist.length > 0) {
      fetchContentDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist])

  const fetchWatchlist = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) throw error
      setWatchlist(data || [])
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      setWatchlist([])
    } finally {
      setLoading(false)
    }
  }

  const fetchContentDetails = async () => {
    setFetchingDetails(true)
    try {
      const detailsPromises = watchlist.map(async (item) => {
        try {
          const response = await getDetails(item.media_type, item.tmdb_id)
          return {
            ...response.data,
            watchlist_id: item.id,
            media_type: item.media_type,
            added_at: item.added_at,
          }
        } catch (error) {
          console.error(`Error fetching details for ${item.tmdb_id}:`, error)
          return null
        }
      })

      const details = await Promise.all(detailsPromises)
      setContentDetails(details.filter(item => item !== null))
    } catch (error) {
      console.error('Error fetching content details:', error)
    } finally {
      setFetchingDetails(false)
    }
  }

  const handleRemoveFromList = async (watchlistId) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId)

      if (error) throw error

      // Update local state
      setWatchlist(prev => prev.filter(item => item.id !== watchlistId))
      setContentDetails(prev => prev.filter(item => item.watchlist_id !== watchlistId))
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    }
  }

  const filteredContent = contentDetails.filter(item => {
    if (selectedFilter === 'all') return true
    return item.media_type === selectedFilter
  })

  const movieCount = contentDetails.filter(item => item.media_type === 'movie').length
  const tvCount = contentDetails.filter(item => item.media_type === 'tv').length

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent px-4 md:px-8 pt-8 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">My List</h1>
        <p className="text-slate-400 text-lg">
          {watchlist.length === 0
            ? 'Your watchlist is empty'
            : `${watchlist.length} ${watchlist.length === 1 ? 'title' : 'titles'} in your list`}
        </p>
      </div>

      {watchlist.length > 0 && (
        <>
          {/* Filter Buttons */}
          <div className="px-4 md:px-8 py-6 border-b border-slate-700/30">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {filters.map((filter) => {
                let count = filteredContent.length
                if (filter.id === 'movie') count = movieCount
                if (filter.id === 'tv') count = tvCount
                if (filter.id === 'all') count = watchlist.length

                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
                      selectedFilter === filter.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className="bg-slate-900/50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Grid */}
          {fetchingDetails ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 md:px-8 py-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-700/50 rounded-lg animate-pulse aspect-[2/3]"
                />
              ))}
            </div>
          ) : filteredContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 md:px-8 py-8">
              {filteredContent.map((item) => (
                <WatchlistCard
                  key={item.watchlist_id}
                  content={item}
                  onRemove={() => handleRemoveFromList(item.watchlist_id)}
                />
              ))}
            </div>
          ) : (
            <NoResultsForFilter filter={selectedFilter} />
          )}
        </>
      )}

      {/* Empty State */}
      {watchlist.length === 0 && (
        <EmptyWatchlist onExplore={() => navigate('/')} />
      )}
    </div>
  )
}

// Watchlist Card Component
const WatchlistCard = ({ content, onRemove }) => {
  const [showOptions, setShowOptions] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const navigate = useNavigate()

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500'
  const posterUrl = content.poster_path
    ? `${imageBaseUrl}${content.poster_path}`
    : '/placeholder.jpg'

  const title = content.title || content.name
  const releaseYear =
    content.release_date?.split('-')[0] || content.first_air_date?.split('-')[0]

  const handleRemove = async (e) => {
    e.stopPropagation()
    setIsRemoving(true)
    await onRemove()
  }

  return (
    <div
      className={`group cursor-pointer transition-all ${
        isRemoving ? 'opacity-50' : ''
      }`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="relative rounded-lg overflow-hidden bg-slate-800">
        <img
          src={posterUrl}
          alt={title}
          className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder.jpg'
          }}
        />

        {/* Overlay with Actions */}
        {showOptions && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/${content.media_type}/${content.id}`)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-3 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              <FiPlay className="w-5 h-5" />
            </button>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white p-3 rounded-full transition-all border border-slate-600/30 disabled:opacity-50"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
          ⭐ {content.vote_average?.toFixed(1)}
        </div>

        {/* Media Type Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white border border-slate-600/30 flex items-center space-x-1">
          {content.media_type === 'tv' ? (
            <>
              <FiTv className="w-3 h-3" />
              <span>TV</span>
            </>
          ) : (
            <>
              <FiFilm className="w-3 h-3" />
              <span>Movie</span>
            </>
          )}
        </div>
      </div>

      {/* Title and Info */}
      <div className="mt-3">
        <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-purple-300 transition-colors">
          {title}
        </h3>
        <div className="flex items-center space-x-2 mt-1">
          {releaseYear && (
            <span className="text-slate-400 text-xs">{releaseYear}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Empty Watchlist Component
const EmptyWatchlist = ({ onExplore }) => {
  return (
    <div className="text-center py-24 px-4">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
        <FiHeart className="w-12 h-12 text-purple-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">
        Your list is empty
      </h2>
      <p className="text-slate-400 mb-8 text-lg max-w-md mx-auto">
        Start adding movies and TV shows to your watchlist and access them anytime
      </p>
      <button
        onClick={onExplore}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50"
      >
        Explore Content
      </button>
    </div>
  )
}

// No Results for Filter Component
const NoResultsForFilter = ({ filter }) => {
  const filterNames = {
    movie: 'movies',
    tv: 'TV shows',
    all: 'content',
  }

  return (
    <div className="text-center py-24 px-4">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
        <FiFilm className="w-10 h-10 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        No {filterNames[filter]} in your list
      </h2>
      <p className="text-slate-400">
        Try selecting a different filter or add more content to your list
      </p>
    </div>
  )
}

export default MyList
