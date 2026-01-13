import { useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiPlay } from 'react-icons/fi'

const SeasonSelector = ({
  seasons,
  selectedSeason,
  onSeasonChange,
  onEpisodePlay,
  tmdbId,
  continueWatchingData,
}) => {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [episodeProgress, setEpisodeProgress] = useState({})
  const { user } = useAuth()

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY

  useEffect(() => {
    if (selectedSeason) {
      fetchEpisodes(selectedSeason)
      loadEpisodeProgress(selectedSeason)
    }
  }, [selectedSeason])

  const fetchEpisodes = async (seasonNumber) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}`,
        {
          params: {
            api_key: API_KEY,
          },
        }
      )
      setEpisodes(response.data.episodes || [])
    } catch (error) {
      console.error('Error fetching episodes:', error)
      setEpisodes([])
    } finally {
      setLoading(false)
    }
  }

  const loadEpisodeProgress = async (seasonNumber) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('continue_watching')
        .select('*')
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId)
        .eq('media_type', 'tv')

      if (data && !error) {
        // Create a map of episode progress
        const progressMap = {}
        data.forEach((item) => {
          if (item.season === seasonNumber) {
            const key = `${item.season}-${item.episode}`
            progressMap[key] = item.progress
          }
        })
        setEpisodeProgress(progressMap)
      }
    } catch (error) {
      console.error('Error loading episode progress:', error)
    }
  }

  const getEpisodeProgress = (seasonNumber, episodeNumber) => {
    const key = `${seasonNumber}-${episodeNumber}`
    return episodeProgress[key] || 0
  }

  const getProgressPercent = (episode) => {
    const progress = getEpisodeProgress(selectedSeason, episode.episode_number)
    const runtime = episode.runtime || 45 // Default to 45 minutes if not available
    return Math.min((progress / (runtime * 60)) * 100, 100)
  }

  const isCurrentlyWatching = (episodeNumber) => {
    return (
      continueWatchingData &&
      continueWatchingData.season === selectedSeason &&
      continueWatchingData.episode === episodeNumber
    )
  }

  if (!seasons || !Array.isArray(seasons)) {
    return null
  }

  const validSeasons = seasons.filter((season) => season.season_number > 0)

  if (validSeasons.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Episodes</h2>

      {/* Season Selector */}
      <div className="flex flex-wrap gap-3">
        {validSeasons.map((season) => (
          <button
            key={season.id}
            onClick={() => onSeasonChange(season.season_number)}
            className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
              selectedSeason === season.season_number
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
            }`}
          >
            Season {season.season_number}
          </button>
        ))}
      </div>

      {/* Episodes List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-700/50 rounded-lg h-32 animate-pulse"
            />
          ))}
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-4">
          {episodes.map((episode) => {
            const progressPercent = getProgressPercent(episode)
            const isCurrent = isCurrentlyWatching(episode.episode_number)

            return (
              <div
                key={episode.id}
                onClick={() => onEpisodePlay(selectedSeason, episode.episode_number)}
                className="bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-700/60 transition-all group relative border border-slate-700/30"
              >
                <div className="flex">
                  {/* Episode Thumbnail */}
                  <div className="w-40 md:w-52 flex-shrink-0 relative">
                    {episode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700/50 flex items-center justify-center">
                        <span className="text-slate-600 text-3xl">📺</span>
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-3 shadow-lg">
                        <FiPlay className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}

                    {/* Continue Watching Badge */}
                    {isCurrent && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                        Continue
                      </div>
                    )}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-base md:text-lg">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      {episode.runtime && (
                        <span className="text-slate-400 text-sm ml-4">
                          {episode.runtime}m
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-2">
                      {episode.overview || 'No overview available.'}
                    </p>

                    <div className="flex items-center space-x-4 text-xs md:text-sm text-slate-500">
                      {episode.air_date && (
                        <span>
                          Aired: {new Date(episode.air_date).toLocaleDateString()}
                        </span>
                      )}
                      {episode.vote_average > 0 && (
                        <span>
                          ⭐ {episode.vote_average.toFixed(1)}
                        </span>
                      )}
                      {progressPercent > 0 && progressPercent < 100 && (
                        <span className="bg-purple-500/20 text-purple-300 font-medium px-2 py-0.5 rounded">
                          {Math.round(progressPercent)}% watched
                        </span>
                      )}
                      {progressPercent >= 100 && (
                        <span className="bg-green-500/20 text-green-300 font-medium px-2 py-0.5 rounded">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No episodes available for this season.</p>
        </div>
      )}
    </div>
  )
}

export default SeasonSelector
