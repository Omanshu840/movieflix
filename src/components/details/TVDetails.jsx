import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function TVDetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        // TODO: Implement fetching TV show details
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching show details:', error);
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="tv-details">
      {show && (
        <>
          <h1>{show.name}</h1>
          <p>{show.overview}</p>
          <div className="details-info">
            <p>First Air Date: {show.first_air_date}</p>
            <p>Rating: {show.vote_average}</p>
            <p>Episodes: {show.number_of_episodes}</p>
          </div>
        </>
      )}
    </div>
  );
}
