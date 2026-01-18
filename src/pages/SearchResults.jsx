import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { search } from '../services/tmdbApi'
import MovieCard from '../components/home/MovieCard'
import Loader from '../components/common/Loader'
import { FiSearch, FiArrowRight } from 'react-icons/fi'

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchInput, setSearchInput] = useState(query || '')

  const filters = [
    { id: 'all', label: 'All', type: 'multi' },
    { id: 'movie', label: 'Movies', type: 'movie' },
    { id: 'tv', label: 'TV Shows', type: 'tv' },
    { id: 'person', label: 'People', type: 'person' },
  ]

  useEffect(() => {
    if (query) {
      setSearchInput(query)
      fetchSearchResults(1)
    }
  }, [query, selectedFilter])

  const fetchSearchResults = async (pageNum) => {
    if (!query) return

    setLoading(true)
    try {
      const currentFilter = filters.find(f => f.id === selectedFilter)
      const response = await search(query, currentFilter.type)
      
      if (pageNum === 1) {
        setResults(response.data.results || [])
      } else {
        setResults(prev => [...prev, ...(response.data.results || [])])
      }
      
      setTotalPages(response.data.total_pages || 0)
      setPage(pageNum)
    } catch (error) {
      console.error('Error searching:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() })
      setPage(1)
    }
  }

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId)
    setPage(1)
  }

  const loadMore = () => {
    if (page < totalPages && !loading) {
      fetchSearchResults(page + 1)
    }
  }

  const filteredResults = results.filter(item => {
    // Filter out items without required data
    if (!item.name && !item.title) return false
    
    // For person type, show only if they have profile path
    if (item.media_type === 'person' && !item.profile_path) return false
    
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 pb-12">
      {/* Header with Search */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent px-4 md:px-8 pt-8 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for movies, TV shows, people..."
              className="w-full bg-slate-800/50 text-white px-5 py-3.5 pr-12 rounded-full border border-slate-600/30 focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-slate-500"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-2 rounded-full transition-all hover:shadow-lg"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {query && (
        <>
          {/* Results Header */}
          <div className="px-4 md:px-8 py-6 border-b border-slate-700/30">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Results for "<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{query}</span>"
            </h2>
            {!loading && (
              <p className="text-slate-400">
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="px-4 md:px-8 py-6">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {loading && page === 1 ? (
            <Loader />
          ) : filteredResults.length > 0 ? (
            <>
              <div className="px-4 md:px-8 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredResults.map((item) => {
                    // Handle person results differently
                    if (item.media_type === 'person') {
                      return <PersonCard key={item.id} person={item} />
                    }
                    
                    return <MovieCard key={item.id} movie={item} />
                  })}
                </div>
              </div>

              {/* Load More Button */}
              {page < totalPages && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More</span>
                        <FiArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <NoResults query={query} />
          )}
        </>
      )}

      {/* Empty State - No Search Query */}
      {!query && (
        <div className="text-center py-20 px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <FiSearch className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Start searching
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Discover your favorite movies, TV shows, and people
          </p>
        </div>
      )}
    </div>
  )
}

// Person Card Component
const PersonCard = ({ person }) => {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500'
  const profileUrl = person.profile_path
    ? `${imageBaseUrl}${person.profile_path}`
    : '/placeholder.jpg'

  const knownFor = person.known_for
    ?.slice(0, 2)
    .map(item => item.title || item.name)
    .join(', ')

  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden bg-slate-800">
        <img
          src={profileUrl}
          alt={person.name}
          className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder.jpg'
          }}
        />

        {/* Known For Badge */}
        {person.known_for_department && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
            {person.known_for_department}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-purple-300 transition-colors">
          {person.name}
        </h3>
        {knownFor && (
          <p className="text-slate-400 text-xs line-clamp-1 mt-1">
            {knownFor}
          </p>
        )}
      </div>
    </div>
  )
}

// No Results Component
const NoResults = ({ query }) => {
  return (
    <div className="text-center py-24 px-4">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
        <FiSearch className="w-12 h-12 text-purple-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">
        No results found
      </h2>
      <p className="text-slate-400 max-w-md mx-auto">
        We couldn't find anything for "<span className="text-purple-300">{query}</span>"
      </p>
      <div className="text-slate-500 text-sm space-y-2 mt-6">
        <p>✓ Try searching with different keywords</p>
        <p>✓ Check your spelling</p>
        <p>✓ Try more general keywords</p>
      </div>
    </div>
  )
}

export default SearchResults
