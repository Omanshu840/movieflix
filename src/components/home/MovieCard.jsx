import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiPlus, FiCheck } from 'react-icons/fi'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500'
  const posterUrl = movie.poster_path
    ? `${imageBaseUrl}${movie.poster_path}`
    : '/placeholder.jpg'

  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie')

  const checkWatchlist = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('tmdb_id', movie.id)
        .eq('media_type', mediaType)
        .single()

      setIsInWatchlist(!!data && !error)
    } catch (error) {
      // Not in watchlist
    }
  }

  const toggleWatchlist = async (e) => {
    e.stopPropagation()
    if (!user) return

    try {
      if (isInWatchlist) {
        await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('tmdb_id', movie.id)
          .eq('media_type', mediaType)

        setIsInWatchlist(false)
      } else {
        await supabase.from('watchlist').insert({
          user_id: user.id,
          tmdb_id: movie.id,
          media_type: mediaType,
        })

        setIsInWatchlist(true)
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  const handleClick = () => {
    navigate(`/${mediaType}/${movie.id}`)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    checkWatchlist()
  }

  const rating = movie.vote_average?.toFixed(1)

  return (
    <div
      className="min-w-[150px] md:min-w-[200px] cursor-pointer transition-all duration-300 hover:scale-110 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative rounded-lg overflow-hidden bg-slate-800">
        <img
          src={posterUrl}
          alt={movie.title || movie.name}
          className="w-full object-cover"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-br from-purple-500 to-blue-500 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg">
          ⭐ {rating}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300">
            <h3 className="text-white font-bold text-sm md:text-base mb-3 line-clamp-2">
              {movie.title || movie.name}
            </h3>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleClick}
                className="flex-1 flex items-center justify-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg py-2 transition-all hover:shadow-lg"
              >
                <FiPlay className="w-4 h-4" />
                <span className="text-xs font-bold">Play</span>
              </button>

              <button
                onClick={toggleWatchlist}
                className="flex items-center justify-center bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg p-2.5 transition-all hover:shadow-lg"
                aria-label={isInWatchlist ? 'Remove from list' : 'Add to list'}
              >
                {isInWatchlist ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiPlus className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
