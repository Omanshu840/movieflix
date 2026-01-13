import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiPlus, FiCheck, FiInfo } from 'react-icons/fi'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

const Hero = ({ movie }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [checkingWatchlist, setCheckingWatchlist] = useState(true)

  const imageBaseUrl = 'https://image.tmdb.org/t/p/original'
  const backdropUrl = movie.backdrop_path
    ? `${imageBaseUrl}${movie.backdrop_path}`
    : `${imageBaseUrl}${movie.poster_path}`

  useEffect(() => {
    checkWatchlist()
  }, [movie.id, user])

  const checkWatchlist = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('tmdb_id', movie.id)
        .eq('media_type', movie.media_type || 'movie')
        .single()

      setIsInWatchlist(!!data && !error)
    } catch (error) {
      console.error('Error checking watchlist:', error)
    } finally {
      setCheckingWatchlist(false)
    }
  }

  const toggleWatchlist = async () => {
    if (!user) return

    try {
      if (isInWatchlist) {
        await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('tmdb_id', movie.id)
          .eq('media_type', movie.media_type || 'movie')

        setIsInWatchlist(false)
      } else {
        await supabase.from('watchlist').insert({
          user_id: user.id,
          tmdb_id: movie.id,
          media_type: movie.media_type || 'movie',
        })

        setIsInWatchlist(true)
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  const handlePlay = () => {
    navigate(`/${movie.media_type || 'movie'}/${movie.id}`)
  }

  const handleMoreInfo = () => {
    navigate(`/${movie.media_type || 'movie'}/${movie.id}`)
  }

  const releaseDate = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'
  const genres = movie.genres?.slice(0, 3).map(g => g.name).join(', ') || 'Entertainment'

  return (
    <div className="relative min-h-[85vh] h-screen">
      {/* Background Image - Right side */}
      <div className="absolute inset-0 right-0 w-7/12 overflow-hidden">
        <img
          src={backdropUrl}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950" />
      </div>

      {/* Content - Left side */}
      <div className="relative h-full flex items-center px-8 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-6 z-10">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-sm font-medium text-gray-400">{releaseDate}</span>
            <span className="text-sm font-medium text-gray-400">•</span>
            <span className="text-sm font-medium text-purple-400">{genres}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
            {movie.title || movie.name}
          </h1>

          {/* Rating and Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-green-400 font-bold text-lg">
                {Math.round(movie.vote_average * 10)}%
              </span>
              <span className="text-gray-300 text-sm">Match</span>
            </div>
            {movie.media_type && (
              <span className="px-3 py-1 border border-purple-500/50 text-purple-300 text-xs font-medium rounded-full uppercase">
                {movie.media_type === 'tv' ? 'Series' : 'Movie'}
              </span>
            )}
          </div>

          {/* Overview */}
          <p className="text-base md:text-lg text-gray-300 line-clamp-3 max-w-2xl drop-shadow-lg leading-relaxed">
            {movie.overview}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handlePlay}
              className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 md:px-10 py-3 md:py-4 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
            >
              <FiPlay className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-base md:text-lg">Watch Now</span>
            </button>

            <button
              onClick={toggleWatchlist}
              disabled={checkingWatchlist}
              className="flex items-center space-x-3 border-2 border-purple-500/50 hover:border-purple-400 text-white font-bold px-8 md:px-10 py-3 md:py-4 rounded-full transition-all hover:bg-purple-500/10 backdrop-blur-sm disabled:opacity-50"
            >
              {isInWatchlist ? (
                <>
                  <FiCheck className="w-6 h-6 md:w-7 md:h-7" />
                  <span className="text-base md:text-lg">In List</span>
                </>
              ) : (
                <>
                  <FiPlus className="w-6 h-6 md:w-7 md:h-7" />
                  <span className="text-base md:text-lg">Add List</span>
                </>
              )}
            </button>

            <button
              onClick={handleMoreInfo}
              className="flex items-center space-x-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-bold px-8 md:px-10 py-3 md:py-4 rounded-full transition-all backdrop-blur-sm"
            >
              <FiInfo className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-base md:text-lg">Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  )
}

export default Hero
