import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDetails } from '../../services/tmdbApi'

const ContinueWatchingCard = ({ item }) => {
  const navigate = useNavigate()
  const [movieData, setMovieData] = useState(null)
  const [loading, setLoading] = useState(true)

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500'

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await getDetails(item.media_type, item.tmdb_id)
        setMovieData(response.data)
      } catch (error) {
        console.error('Error fetching movie data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieData()
  }, [item.tmdb_id, item.media_type])

  if (loading || !movieData) {
    return (
      <div className="min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] bg-gray-800 rounded animate-pulse" />
    )
  }

  const posterUrl = movieData.poster_path
    ? `${imageBaseUrl}${movieData.poster_path}`
    : '/placeholder.jpg'

  const progressPercent = (item.progress / (movieData.runtime * 60)) * 100 || 0

  const handleClick = () => {
    navigate(`/${item.media_type}/${item.tmdb_id}`)
  }

  return (
    <div
      className="min-w-[150px] md:min-w-[200px] cursor-pointer transition-all duration-300 hover:scale-110"
      onClick={handleClick}
    >
      <div className="relative rounded-lg overflow-hidden bg-slate-800">
        <img
          src={posterUrl}
          alt={movieData.title || movieData.name}
          className="w-full h-[225px] md:h-[300px] object-cover"
          loading="lazy"
        />

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        {/* Continue Badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white">
          Continue
        </div>
      </div>

      <h3 className="text-white text-sm font-semibold mt-3 line-clamp-1">
        {movieData.title || movieData.name}
      </h3>
    </div>
  )
}

export default ContinueWatchingCard
