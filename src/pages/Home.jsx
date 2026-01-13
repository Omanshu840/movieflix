import { useState, useEffect } from 'react'
import Hero from '../components/home/Hero'
import ContentRow from '../components/home/ContentRow'
import { getTrending, getPopular, getTopRated, discoverByGenre } from '../services/tmdbApi'
import { useContinueWatching } from '../hooks/useContinueWatching'
import Loader from '../components/common/Loader'

const Home = () => {
  const [heroMovie, setHeroMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const { continueWatching, loading: cwLoading } = useContinueWatching()

  useEffect(() => {
    const fetchHeroMovie = async () => {
      try {
        const response = await getTrending('movie', 'day')
        const movies = response.data.results
        // Get a random trending movie for hero
        const randomMovie = movies[Math.floor(Math.random() * Math.min(5, movies.length))]
        setHeroMovie(randomMovie)
      } catch (error) {
        console.error('Error fetching hero movie:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHeroMovie()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 min-h-screen">
      {/* Hero Section */}
      {heroMovie && <Hero movie={heroMovie} />}

      {/* Content Rows */}
      <div className="relative z-10 -mt-32 space-y-12 pb-12 px-4 md:px-8">
        {/* Continue Watching */}
        {!cwLoading && continueWatching.length > 0 && (
          <ContentRow
            title="Continue Watching"
            items={continueWatching}
            isContinueWatching={true}
          />
        )}

        {/* Trending Now */}
        <ContentRow
          title="Trending Now"
          fetchFunction={() => getTrending('all', 'day')}
        />

        {/* Popular Movies */}
        <ContentRow
          title="Popular Movies"
          fetchFunction={() => getPopular('movie')}
        />

        {/* Popular TV Shows */}
        <ContentRow
          title="Popular TV Shows"
          fetchFunction={() => getPopular('tv')}
        />

        {/* Top Rated Movies */}
        <ContentRow
          title="Top Rated Movies"
          fetchFunction={() => getTopRated('movie')}
        />

        {/* Top Rated TV Shows */}
        <ContentRow
          title="Top Rated TV Shows"
          fetchFunction={() => getTopRated('tv')}
        />

        {/* Action Movies */}
        <ContentRow
          title="Action Movies"
          fetchFunction={() => discoverByGenre('movie', 28)}
        />

        {/* Comedy Movies */}
        <ContentRow
          title="Comedy Movies"
          fetchFunction={() => discoverByGenre('movie', 35)}
        />

        {/* Horror Movies */}
        <ContentRow
          title="Horror Movies"
          fetchFunction={() => discoverByGenre('movie', 27)}
        />

        {/* Sci-Fi Movies */}
        <ContentRow
          title="Science Fiction"
          fetchFunction={() => discoverByGenre('movie', 878)}
        />

        {/* Romance Movies */}
        <ContentRow
          title="Romance"
          fetchFunction={() => discoverByGenre('movie', 10749)}
        />

        {/* Documentaries */}
        <ContentRow
          title="Documentaries"
          fetchFunction={() => discoverByGenre('movie', 99)}
        />
      </div>
    </div>
  )
}

export default Home
