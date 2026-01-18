import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import MovieCard from './MovieCard'
import ContinueWatchingCard from './ContinueWatchingCard'

const ContentRow = ({ title, fetchFunction, items, isContinueWatching = false }) => {
  const [content, setContent] = useState(items || [])
  const [loading, setLoading] = useState(!items)
  const [scrollPosition, setScrollPosition] = useState(0)
  const rowRef = useRef(null)

  useEffect(() => {
    if (items) {
      setContent(items)
      return
    }

    const fetchContent = async () => {
      try {
        const response = await fetchFunction()
        setContent(response.data.results || [])
      } catch (error) {
        console.error(`Error fetching ${title}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [fetchFunction, items, title])

  const scroll = (direction) => {
    const container = rowRef.current
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
    if (rowRef.current) {
      setScrollPosition(rowRef.current.scrollLeft)
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">{title}</h2>
        <div className="flex space-x-2 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] bg-slate-700/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (content.length === 0) return null

  const showLeftButton = scrollPosition > 0
  const showRightButton = rowRef.current
    ? scrollPosition < rowRef.current.scrollWidth - rowRef.current.offsetWidth - 10
    : true

  return (
    <div className="relative group px-4 md:px-8">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">{title}</h2>

      {/* Left Arrow */}
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-slate-900 to-transparent hover:from-slate-800 text-white p-2 md:p-3 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      )}

      {/* Content Container */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="flex space-x-2 md:space-x-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {content.map((item) =>
          isContinueWatching ? (
            <ContinueWatchingCard key={item.id} item={item} />
          ) : (
            <MovieCard key={item.id} movie={item} isHomePage={true} />
          )
        )}
      </div>

      {/* Right Arrow */}
      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-l from-slate-900 to-transparent hover:from-slate-800 text-white p-2 md:p-3 rounded-l opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      )}
    </div>
  )
}

export default ContentRow
