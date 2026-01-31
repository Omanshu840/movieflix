import axios from 'axios'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
// const BASE_URL = 'https://api.themoviedb.org/3'
const BASE_URL = 'https://tmdb-proxy.tmdb-proxy-movieflix.workers.dev/3'

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
})

export const getTrending = (mediaType = 'all', timeWindow = 'week') => {
  return tmdbApi.get(`/trending/${mediaType}/${timeWindow}`)
}

export const getPopular = (mediaType = 'movie', page = 1) => {
  return tmdbApi.get(`/${mediaType}/popular`, {
    params: { page },
  })
}

export const getTopRated = (mediaType = 'movie', page = 1) => {
  return tmdbApi.get(`/${mediaType}/top_rated`, {
    params: { page },
  })
}

export const getDetails = (mediaType, id) => {
  return tmdbApi.get(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'videos,credits,recommendations,similar',
    },
  })
}

export const search = (query, mediaType = 'multi', page = 1) => {
  return tmdbApi.get(`/search/${mediaType}`, {
    params: { query, page },
  })
}

export const getGenres = (mediaType = 'movie') => {
  return tmdbApi.get(`/genre/${mediaType}/list`)
}

export const discoverByGenre = (mediaType, genreId, page = 1) => {
  return tmdbApi.get(`/discover/${mediaType}`, {
    params: { with_genres: genreId, page },
  })
}

export const getEpisodes = (tmdbId, seasonNumber) => {
  return tmdbApi.get(`/tv/${tmdbId}/season/${seasonNumber}`)
}

export default tmdbApi
