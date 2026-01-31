import { useState, useEffect } from 'react'
import { getPopular, getTopRated, discoverByGenre, getGenres } from '../services/tmdbApi'
import MovieCard from '../components/home/MovieCard'
import Loader from '../components/common/Loader'

const TVShows = () => {
  const [shows, setShows] = useState([])
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('popular')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const categories = [
    { id: 'popular', label: 'Popular' },
    { id: 'top_rated', label: 'Top Rated' },
    { id: 'action', label: 'Action & Adventure', genreId: 10759 },
    { id: 'comedy', label: 'Comedy', genreId: 35 },
    { id: 'drama', label: 'Drama', genreId: 18 },
    { id: 'crime', label: 'Crime', genreId: 80 },
    { id: 'mystery', label: 'Mystery', genreId: 9648 },
    { id: 'sci-fi', label: 'Sci-Fi & Fantasy', genreId: 10765 },
    { id: 'animation', label: 'Animation', genreId: 16 },
    { id: 'documentary', label: 'Documentary', genreId: 99 },
    { id: 'kids', label: 'Kids', genreId: 10762 },
    { id: 'reality', label: 'Reality', genreId: 10764 },
  ]

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchShows(1)
  }, [selectedCategory, selectedGenre])

  const fetchGenres = async () => {
    try {
      const response = await getGenres('tv')
      setGenres(response.data.genres || [])
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  const fetchShows = async (pageNum) => {
    setLoading(true)
    try {
      let response

      if (selectedGenre) {
        response = await discoverByGenre('tv', selectedGenre, pageNum)
      } else if (selectedCategory === 'popular') {
        response = await getPopular('tv', pageNum)
      } else if (selectedCategory === 'top_rated') {
        response = await getTopRated('tv', pageNum)
      } else {
        const category = categories.find((cat) => cat.id === selectedCategory)
        if (category?.genreId) {
          response = await discoverByGenre('tv', category.genreId, pageNum)
        }
      }

      if (response) {
        const newShows = response.data.results || []
        setShows(pageNum === 1 ? newShows : [...shows, ...newShows])
        setHasMore(response.data.page < response.data.total_pages)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching TV shows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedGenre(null)
    setPage(1)
  }

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId)
    setSelectedCategory(null)
    setPage(1)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchShows(page + 1)
    }
  }

  return (
    <div className="min-h-screen pt-8 px-4 md:px-8 pb-12 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          TV Shows
        </h1>
        <p className="text-gray-400">Discover popular TV series</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id && !selectedGenre
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">All Genres</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreChange(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGenre === genre.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* TV Shows Grid */}
      {loading && page === 1 ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show) => (
              <MovieCard key={show.id} movie={show} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && shows.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
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
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && shows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No TV shows found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TVShows
