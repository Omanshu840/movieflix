import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDetails } from "../services/tmdbApi";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/details/VideoPlayer";
import SeasonSelector from "../components/details/SeasonSelector";
import Loader from "../components/common/Loader";
import { FiPlay, FiPlus, FiCheck, FiX } from "react-icons/fi";

const Details = () => {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [continueWatchingData, setContinueWatchingData] = useState(null);

  const imageBaseUrl = "https://image.tmdb.org/t/p/original";

  useEffect(() => {
    fetchDetails();
    checkWatchlist();
    loadContinueWatching();
  }, [id, mediaType]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getDetails(mediaType, id);
      setContent(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const loadContinueWatching = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("continue_watching")
        .select("*")
        .eq("user_id", user.id)
        .eq("tmdb_id", id)
        .eq("media_type", mediaType)
        .single();

      if (data && !error) {
        setContinueWatchingData(data);
        // Set the season and episode from continue watching
        if (mediaType === "tv") {
          setSelectedSeason(data.season || 1);
          setSelectedEpisode(data.episode || 1);
        }
      } else if (mediaType === "tv") {
        // Default to first season if no continue watching data
        setSelectedSeason(1);
        setSelectedEpisode(1);
      }
    } catch (error) {
      console.error("Error loading continue watching:", error);
    }
  };

  const checkWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("tmdb_id", id)
        .eq("media_type", mediaType)
        .single();

      setIsInWatchlist(!!data && !error);
    } catch (error) {
      // Not in watchlist
    }
  };

  const toggleWatchlist = async () => {
    if (!user) return;

    try {
      if (isInWatchlist) {
        await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("tmdb_id", id)
          .eq("media_type", mediaType);

        setIsInWatchlist(false);
      } else {
        await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: id,
          media_type: mediaType,
        });

        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  const handlePlay = (season = selectedSeason, episode = selectedEpisode) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    // Refresh continue watching data after closing player
    loadContinueWatching();
  };

  if (loading) {
    return <Loader />;
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Content not found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = content.backdrop_path
    ? `${imageBaseUrl}${content.backdrop_path}`
    : `${imageBaseUrl}${content.poster_path}`;

  const title = content.title || content.name;
  const releaseYear =
    content.release_date?.split("-")[0] ||
    content.first_air_date?.split("-")[0];
  const runtime = content.runtime
    ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
    : content.episode_run_time?.[0]
    ? `${content.episode_run_time[0]}m`
    : null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 pb-12">
        {/* Hero Section */}
        <div className="relative h-[70vh] md:h-[80vh]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent" />
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 md:left-8 md:top-8 z-20 bg-slate-900/60 hover:bg-slate-800/80 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-slate-700/30"
            aria-label="Go back"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Content Info */}
          <div className="relative h-full flex items-end px-4 md:px-8 lg:px-16 pb-12">
            <div className="max-w-4xl space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg">
                {title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-3 py-1 rounded-full text-lg">
                  {Math.round(content.vote_average * 10)}%
                </span>
                {releaseYear && (
                  <span className="text-slate-300">{releaseYear}</span>
                )}
                {runtime && <span className="text-slate-300">{runtime}</span>}
                {content.number_of_seasons && (
                  <span className="text-slate-300">
                    {content.number_of_seasons}{" "}
                    {content.number_of_seasons === 1 ? "Season" : "Seasons"}
                  </span>
                )}
              </div>

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {content.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-1.5 bg-slate-700/50 backdrop-blur text-slate-300 rounded-full text-sm border border-slate-600/30 hover:border-purple-500/30 transition-colors"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-base md:text-lg text-slate-300 max-w-3xl line-clamp-3">
                {content.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handlePlay()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50"
                >
                  <FiPlay className="w-5 h-5" />
                  <span className="text-base">
                    {continueWatchingData ? "Continue Watching" : "Play"}
                  </span>
                </button>

                <button
                  onClick={toggleWatchlist}
                  className="flex items-center space-x-2 bg-slate-700/40 hover:bg-slate-600/50 text-white font-bold px-8 py-3 rounded-full transition-all border border-slate-600/30 hover:border-purple-500/30"
                >
                  {isInWatchlist ? (
                    <>
                      <FiCheck className="w-5 h-5" />
                      <span className="text-base">In My List</span>
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5" />
                      <span className="text-base">Add to List</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Season Selector for TV Shows */}
        {mediaType === "tv" &&
          content?.seasons &&
          Array.isArray(content.seasons) &&
          content.seasons.length > 0 && (
            <div className="px-4 md:px-8 lg:px-16 mt-12">
              <SeasonSelector
                seasons={content.seasons}
                selectedSeason={selectedSeason}
                selectedEpisode={selectedEpisode}
                onSeasonChange={setSelectedSeason}
                onEpisodeChange={setSelectedEpisode}
                onEpisodePlay={handlePlay}
                tmdbId={id}
                continueWatchingData={continueWatchingData}
              />
            </div>
          )}
      </div>

      {/* Video Player */}
      {isPlaying && (
        <VideoPlayer
          tmdbId={id}
          mediaType={mediaType}
          season={selectedSeason}
          episode={selectedEpisode}
          onClose={handleClosePlayer}
        />
      )}
    </>
  );
};

export default Details;
