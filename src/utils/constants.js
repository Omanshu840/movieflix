// API Keys and URLs
export const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes
export const POSTER_SIZE = 'w342';
export const BACKDROP_SIZE = 'w1280';
export const PROFILE_SIZE = 'w342';

// Routes
export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  TV_SHOWS: '/tv-shows',
  MY_LIST: '/my-list',
  MOVIE_DETAILS: '/movie/:id',
  TV_DETAILS: '/tv/:id',
  SEARCH: '/search',
  LOGIN: '/login',
};

// Common constants
export const ITEMS_PER_PAGE = 20;
export const REQUEST_TIMEOUT = 10000;

// Colors
export const COLORS = {
  PRIMARY_PURPLE: '#7C3AED',
  PRIMARY_BLUE: '#3B82F6',
  SECONDARY_PURPLE: '#6D28D9',
  DARK_BG: '#0F172A',
  DARKER_BG: '#020617',
  CARD_BG: '#1E293B',
  ACCENT: '#8B5CF6',
  LIGHT: '#ffffff',
  GRAY: '#94A3B8',
  GRAY_DARK: '#475569',
};
