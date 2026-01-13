import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../home/MovieCard';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const query = searchParams.get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        if (query) {
          // TODO: Implement search functionality
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error searching:', error);
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="search-results">
      <h1>Search Results for "{query}"</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="results-grid">
          {results.map((item) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      )}
    </div>
  );
}
