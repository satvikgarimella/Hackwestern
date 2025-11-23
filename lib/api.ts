/**
 * API client for backend communication
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export interface PollAnalysis {
  explainer?: {
    explanation: string
    poll_question: string
    options: string[]
  }
  whale_watch?: {
    risk_score: number
    flags: Array<{
      type: string
      severity: string
      message: string
    }>
    total_votes: number
    new_wallet_percentage: number
  }
  economic?: {
    risk_score: number
    flags: Array<{
      type: string
      severity: string
      message: string
    }>
    projections: Record<string, any>
    recommendation: string
  }
  consensus?: {
    combined_risk_score: number
    agents_analyzed: number
  }
}

export interface Vote {
  poll_id: string
  wallet_address: string
  vote_option: string
  signature: string
  wallet_age_days?: number
  sol_balance?: number
}

/**
 * Analyze a poll with AI agents
 */
export async function analyzePoll(
  pollId: string,
  agentType: 'explainer' | 'whale_watch' | 'economic' | 'all' = 'all'
): Promise<PollAnalysis> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        poll_id: pollId,
        agent_type: agentType,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error analyzing poll:', error)
    throw error
  }
}

/**
 * Submit a vote
 */
export async function submitVote(vote: Vote): Promise<{ success: boolean; whale_watch_analysis?: any }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vote),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error submitting vote:', error)
    throw error
  }
}

/**
 * Get all polls
 */
export async function getPolls(): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/polls`)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.polls
  } catch (error) {
    console.error('Error fetching polls:', error)
    throw error
  }
}

/**
 * Get specific poll with analysis
 */
export async function getPoll(pollId: string): Promise<{
  poll: any
  votes: any[]
  analyses: any[]
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/polls/${pollId}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching poll:', error)
    throw error
  }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`)
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

