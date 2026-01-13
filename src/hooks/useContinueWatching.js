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
        .limit(10)

      if (error) throw error
      setContinueWatching(data || [])
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
