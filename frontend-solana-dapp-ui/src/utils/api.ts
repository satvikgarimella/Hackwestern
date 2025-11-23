// API Configuration - easily changeable
const API_CONFIG = {
  BASE_URL: "http://localhost:3000",
  STATS_ENDPOINT: "/api/polls/stats",
  VOTE_ENDPOINT: "/api/polls/vote",
  TIMEOUT: 8000, // 8 seconds timeout
  POLL_INTERVAL: 10000, // 10 seconds polling
}

export interface PollStats {
  total: number
  distribution: number[]
}

export interface VotePayload {
  pollId: number
  choiceIndex: number
  voter: string
  message: string
  signature: string
  timestamp: number
}

// Fetch poll stats with timeout and error handling
export async function fetchPollStats(): Promise<PollStats | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.STATS_ENDPOINT}`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[v0] API Error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return {
      total: data.total || 0,
      distribution: data.distribution || [0, 0, 0],
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[v0] Poll stats fetch timeout")
    } else {
      console.error("[v0] Error fetching poll stats:", error)
    }
    return null
  }
}

// Submit a vote to the backend
export async function submitVote(voteData: VotePayload): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.VOTE_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(voteData),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[v0] Vote submission error: ${response.status}`)
      return false
    }

    console.log("[v0] Vote submitted successfully")
    return true
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[v0] Vote submission timeout")
    } else {
      console.error("[v0] Error submitting vote:", error)
    }
    return false
  }
}

export { API_CONFIG }
