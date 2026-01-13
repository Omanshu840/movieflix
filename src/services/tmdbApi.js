import axios from 'axios'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
})

export const getTrending = (mediaType = 'all', timeWindow = 'week') => {
  return tmdbApi.get(`/trending/${mediaType}/${timeWindow}`)
}

export const getPopular = (mediaType = 'movie') => {
  return tmdbApi.get(`/${mediaType}/popular`)
}

export const getTopRated = (mediaType = 'movie') => {
  return tmdbApi.get(`/${mediaType}/top_rated`)
}

export const getDetails = (mediaType, id) => {
  return tmdbApi.get(`/${mediaType}/${id}`, {
    params: {
      append_to_response: 'videos,credits,recommendations,similar',
    },
  })
}

export const search = (query, mediaType = 'multi') => {
  return tmdbApi.get(`/search/${mediaType}`, {
    params: { query },
  })
}

export const getGenres = (mediaType = 'movie') => {
  return tmdbApi.get(`/genre/${mediaType}/list`)
}

export const discoverByGenre = (mediaType, genreId) => {
  return tmdbApi.get(`/discover/${mediaType}`, {
    params: { with_genres: genreId },
  })
}

export default tmdbApi
