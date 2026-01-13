import { useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const CastSection = ({ cast }) => {
  const scrollRef = useRef(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w185'

  const scroll = (direction) => {
    const container = scrollRef.current
    if (!container) return

    const scrollAmount = container.offsetWidth * 0.8
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    })

    setScrollPosition(newPosition)
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft)
    }
  }

  const showLeftButton = scrollPosition > 0
  const showRightButton = scrollRef.current
    ? scrollPosition < scrollRef.current.scrollWidth - scrollRef.current.offsetWidth - 10
    : true

  return (
    <div className="relative group">
      <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>

      {/* Left Arrow */}
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-slate-900 to-transparent hover:from-slate-800 text-white p-3 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Cast Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cast.slice(0, 20).map((person) => (
          <div
            key={person.id}
            className="flex-shrink-0 w-32 md:w-40 group/item cursor-pointer"
          >
            <div className="relative mb-3 overflow-hidden rounded-lg">
              {person.profile_path ? (
                <img
                  src={`${imageBaseUrl}${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-48 object-cover group-hover/item:scale-110 transition-transform"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <span className="text-slate-600 text-4xl">👤</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover/item:text-purple-300 transition-colors">
              {person.name}
            </h3>
            <p className="text-slate-400 text-xs line-clamp-2">
              {person.character}
            </p>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-l from-slate-900 to-transparent hover:from-slate-800 text-white p-3 rounded-l opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

export default CastSection
