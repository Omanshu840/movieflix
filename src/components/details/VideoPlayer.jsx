import { useEffect, useState, useRef } from 'react'
import { getEmbedUrl, setupPlayerListener } from '../../services/vidkingApi'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiX } from 'react-icons/fi'

const VideoPlayer = ({ tmdbId, mediaType, season = 1, episode = 1, onClose, source}) => {
  const [embedUrl, setEmbedUrl] = useState('')
  const [savedProgress, setSavedProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef(null)
  const { user } = useAuth()
  const lastSaveTimeRef = useRef(0)
  const SAVE_INTERVAL = 1 * 60// 5 minutes in seconds

  // Fetch saved progress on component mount or when content changes
  useEffect(() => {
    const fetchSavedProgress = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        let query = supabase
          .from('continue_watching')
          .select('progress')
          .eq('user_id', user.id)
          .eq('tmdb_id', tmdbId)
          .eq('media_type', mediaType)

        if (mediaType === 'tv') {
          query = query.eq('season', season).eq('episode', episode)
        }

        const { data, error } = await query.single()

        if (!error && data) {
          setSavedProgress(data.progress)
        } else {
          setSavedProgress(null)
        }
      } catch (error) {
        console.error('Error fetching saved progress:', error)
        setSavedProgress(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedProgress()
    console.log('Fetching saved progress for:', { tmdbId, mediaType, season, episode });
  }, [tmdbId, mediaType, season, episode, user])

  // Generate embed URL
  useEffect(() => {
    if (isLoading) return

    const url = getEmbedUrl(tmdbId, mediaType, source, season, episode, {
      color: '7C3AED',
      autoPlay: true,
      nextEpisode: mediaType === 'tv',
      episodeSelector: mediaType === 'tv',
      progress: savedProgress
    })
    setEmbedUrl(url)
    console.log('Generated embed URL:', url);

    // Set progress in lastSaveTimeRef if available
    if (savedProgress !== null) {
      lastSaveTimeRef.current = savedProgress
    }
  }, [tmdbId, mediaType, season, episode, source, savedProgress, isLoading])


  useEffect(() => {
    const cleanup = setupPlayerListener(async (eventData) => {
      if (!user) return

      const currentTime = Math.floor(eventData.currentTime)

      // Save progress every 5 minutes during playback
      if (eventData.event === 'timeupdate') {
        const timeSinceLastSave = currentTime - lastSaveTimeRef.current

        if (timeSinceLastSave >= SAVE_INTERVAL) {
          await saveProgress(currentTime)
          lastSaveTimeRef.current = currentTime
        }
      }

      // Delete progress when video ends
      if (eventData.event === 'ended') {
        await deleteProgress()
      }
    })

    return cleanup
  }, [tmdbId, mediaType, season, episode, user])

  const saveProgress = async (currentTime) => {
    if (!user) return

    const upsertData = {
      user_id: user.id,
      tmdb_id: tmdbId,
      media_type: mediaType,
      season: 0,
      episode: 0,
      progress: currentTime,
      updated_at: new Date().toISOString(),
    }

    if (mediaType === 'tv') {
      upsertData.season = season
      upsertData.episode = episode
    }

    try {
      await supabase
        .from('continue_watching')
        .upsert(upsertData, {
          onConflict: 'user_id,tmdb_id,media_type,season,episode'
        })
      
      console.log('Progress saved:', currentTime)
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const deleteProgress = async () => {
    if (!user) return

    let query = supabase
      .from('continue_watching')
      .delete()
      .eq('user_id', user.id)
      .eq('tmdb_id', tmdbId)
      .eq('media_type', mediaType)

    if (mediaType === 'tv') {
      query = query.eq('season', season).eq('episode', episode)
    }

    try {
      await query
      console.log('Progress deleted - video ended')
    } catch (error) {
      console.error('Error deleting progress:', error)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 bg-slate-900/60 hover:bg-slate-800/80 text-white rounded-full p-3 transition-all backdrop-blur-sm border border-slate-700/30"
      >
        <FiX className="w-6 h-6" />
      </button>

      {isLoading && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {(!isLoading && embedUrl) && (
        (source === 'videasy') ? (
          <iframe
          ref={iframeRef}
          // sandbox="allow-scripts"
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          playsInline
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
        />
        ) : (
        <iframe
          ref={iframeRef}
          sandbox={"allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation"}
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          playsInline
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
        />
        )
      )}
    </div>
  )
}

export default VideoPlayer
