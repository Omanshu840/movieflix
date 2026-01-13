import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const TrailerModal = ({ isOpen, onClose, videoKey, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-slate-900/60 hover:bg-slate-800/80 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-slate-700/30 z-10"
        aria-label="Close trailer"
      >
        <FiX className="w-6 h-6" />
      </button>

      {/* Video Container */}
      <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20">
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
          title={`${title} - Trailer`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export default TrailerModal
