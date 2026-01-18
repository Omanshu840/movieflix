import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useContinueWatching = () => {
  const [continueWatching, setContinueWatching] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchContinueWatching = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('continue_watching')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Filter for unique tmdb_id, keeping only the latest episode for each
      const uniqueData = {}
      data?.forEach((item) => {
        if (!uniqueData[item.tmdb_id]) {
          uniqueData[item.tmdb_id] = item
        }
      })

      // Convert back to array and sort by most recent update
      const filteredData = Object.values(uniqueData).sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      ).slice(0, 10)

      setContinueWatching(filteredData)
    } catch (error) {
      console.error('Error fetching continue watching:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContinueWatching()
  }, [user])

  return { continueWatching, loading, refetch: fetchContinueWatching }
}
