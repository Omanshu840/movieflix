import { useState, useEffect } from 'react';

export function useMovies(fetchFunction, initialPage = 1) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const data = await fetchFunction(page);
        setMovies(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [page, fetchFunction]);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => (p > 1 ? p - 1 : 1));
  const goToPage = (pageNum) => setPage(pageNum);

  return {
    movies,
    isLoading,
    error,
    page,
    nextPage,
    prevPage,
    goToPage,
  };
}
