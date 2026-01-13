/**
 * VidKing Player Service
 * Generate embed URLs for movies and TV shows
 */

const BASE_URL = 'https://www.vidking.net/embed'

/**
 * Generate VidKing embed URL
 * @param {number} tmdbId - TMDB ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @param {number} season - Season number (for TV)
 * @param {number} episode - Episode number (for TV)
 * @param {object} options - Additional options
 * @returns {string} Embed URL
 */
export const getEmbedUrl = (tmdbId, mediaType, season = null, episode = null, options = {}) => {
  const {
    color = 'e50914', // Netflix red
    autoPlay = true,
    nextEpisode = true,
    episodeSelector = true,
    progress = null,
  } = options

  let url = ''

  if (mediaType === 'movie') {
    url = `${BASE_URL}/movie/${tmdbId}`
  } else if (mediaType === 'tv' && season && episode) {
    url = `${BASE_URL}/tv/${tmdbId}/${season}/${episode}`
  } else {
    throw new Error('Invalid media type or missing season/episode for TV show')
  }

  // Build query parameters
  const params = new URLSearchParams()
  params.append('color', color)
  params.append('autoPlay', autoPlay)

  if (mediaType === 'tv') {
    params.append('nextEpisode', nextEpisode)
    params.append('episodeSelector', episodeSelector)
  }

  if (progress !== null) {
    params.append('progress', progress)
  }

  return `${url}?${params.toString()}`
}

/**
 * Setup message listener for player events
 * @param {function} callback - Callback function to handle events
 */
export const setupPlayerListener = (callback) => {
  const handleMessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'PLAYER_EVENT') {
          callback(data.data)
        }
      } catch (error) {
        console.error('Error parsing player event:', error)
      }
    }
  }

  window.addEventListener('message', handleMessage)

  // Return cleanup function
  return () => window.removeEventListener('message', handleMessage)
}

export default { getEmbedUrl, setupPlayerListener }
