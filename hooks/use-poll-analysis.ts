/**
 * Custom hook for fetching and managing poll analysis
 */
import { useState, useEffect } from 'react'
import { analyzePoll, getPoll, PollAnalysis } from '@/lib/api'

export function usePollAnalysis(pollId: string | null) {
  const [analysis, setAnalysis] = useState<PollAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pollId) return

    const fetchAnalysis = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await analyzePoll(pollId, 'all')
        setAnalysis(result)
      } catch (err) {
        console.error('Error fetching analysis:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [pollId])

  const refresh = async () => {
    if (!pollId) return

    setLoading(true)
    setError(null)

    try {
      const result = await analyzePoll(pollId, 'all')
      setAnalysis(result)
    } catch (err) {
      console.error('Error refreshing analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh analysis')
    } finally {
      setLoading(false)
    }
  }

  return {
    analysis,
    loading,
    error,
    refresh,
  }
}

export function usePoll(pollId: string | null) {
  const [poll, setPoll] = useState<any | null>(null)
  const [votes, setVotes] = useState<any[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pollId) return

    const fetchPoll = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getPoll(pollId)
        setPoll(data.poll)
        setVotes(data.votes)
        setAnalyses(data.analyses)
      } catch (err) {
        console.error('Error fetching poll:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch poll')
      } finally {
        setLoading(false)
      }
    }

    fetchPoll()
  }, [pollId])

  const refresh = async () => {
    if (!pollId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getPoll(pollId)
      setPoll(data.poll)
      setVotes(data.votes)
      setAnalyses(data.analyses)
    } catch (err) {
      console.error('Error refreshing poll:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh poll')
    } finally {
      setLoading(false)
    }
  }

  return {
    poll,
    votes,
    analyses,
    loading,
    error,
    refresh,
  }
}

