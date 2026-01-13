// Utility helper functions

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatRuntime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getImageUrl = (imagePath, size = 'w342') => {
  const baseUrl = 'https://image.tmdb.org/t/p';
  return `${baseUrl}/${size}${imagePath}`;
};

export const getRatingColor = (rating) => {
  if (rating >= 8) return '#4CAF50'; // Green
  if (rating >= 6) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getGenreEmoji = (genreName) => {
  const emojiMap = {
    Action: '🔫',
    Comedy: '😂',
    Drama: '🎭',
    Horror: '👻',
    Romance: '❤️',
    Thriller: '😨',
    Animation: '🎨',
    Adventure: '🗺️',
  };
  return emojiMap[genreName] || '🎬';
};
