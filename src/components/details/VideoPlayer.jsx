import { useEffect, useState, useRef } from 'react'
import { getEmbedUrl, setupPlayerListener } from '../../services/vidkingApi'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiX } from 'react-icons/fi'

const VideoPlayer = ({ tmdbId, mediaType, season = 1, episode = 1, onClose }) => {
  const [embedUrl, setEmbedUrl] = useState('')
  const { user } = useAuth()
  const lastSaveTimeRef = useRef(0)
  const SAVE_INTERVAL = 5 * 60 // 5 minutes in seconds

  useEffect(() => {
    // Generate embed URL without saved progress - VidKing handles it
    const url = getEmbedUrl(tmdbId, mediaType, season, episode, {
      color: 'e50914',
      autoPlay: true,
      nextEpisode: mediaType === 'tv',
      episodeSelector: mediaType === 'tv',
    })
    setEmbedUrl(url)
  }, [tmdbId, mediaType, season, episode])

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
          onConflict: mediaType === 'tv' 
            ? 'user_id,tmdb_id,media_type,season,episode'
            : 'user_id,tmdb_id,media_type'
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

      {embedUrl && (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      )}
    </div>
  )
}

export default VideoPlayer
