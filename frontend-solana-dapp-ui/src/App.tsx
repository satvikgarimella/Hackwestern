"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useState, useEffect, useRef } from "react"
import "./App.css"
import { PollCard } from "./components/PollCard"
import { StatsDisplay } from "./components/StatsDisplay"
import { ParticleBackground } from "./components/ParticleBackground"
import { fetchPollData, convertPollDataToStats, submitVoteToSolana, SOLANA_CONFIG } from "./utils/solana.ts"

interface VoteData {
  pollId: number
  choiceIndex: number
  voter: string
  timestamp: number
  txSignature?: string
}

export default function App() {
  const { publicKey, sendTransaction } = useWallet()
  const [isVoting, setIsVoting] = useState(false)
  const [voteConfirmation, setVoteConfirmation] = useState<VoteData | null>(null)
  const [userVotes, setUserVotes] = useState(0)
  const [pollStats, setPollStats] = useState({ total: 0, distribution: [0, 0, 0] })
  const [pollError, setPollError] = useState(false)
  const [failureCount, setFailureCount] = useState(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pollId = 1
  const options = [
    { title: "Option A", emoji: "🚀", description: "Launch mode" },
    { title: "Option B", emoji: "🎯", description: "Precision focus" },
    { title: "Option C", emoji: "⚡", description: "Speed boost" },
  ]

  useEffect(() => {
    if (publicKey) {
      try {
        const walletKey = publicKey.toBase58()
        const stored = localStorage.getItem(`votes_${walletKey}`)
        if (stored) {
          const votes = JSON.parse(stored)
          setUserVotes(Array.isArray(votes) ? votes.length : 0)
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [publicKey])

  useEffect(() => {
    const initialFetch = async () => {
      const pollData = await fetchPollData()
      if (pollData) {
        const stats = convertPollDataToStats(pollData)
        setPollStats(stats)
        setPollError(false)
        setFailureCount(0)
      } else {
        setFailureCount((prev) => prev + 1)
      }
    }

    initialFetch()

    // Set up polling interval every 10 seconds
    pollingIntervalRef.current = setInterval(async () => {
      const pollData = await fetchPollData()

      if (pollData) {
        const stats = convertPollDataToStats(pollData)
        setPollStats(stats)
        setPollError(false)
        setFailureCount(0)
      } else {
        // Increment failure count and pause after 3 failures
        const newFailureCount = failureCount + 1
        setFailureCount(newFailureCount)

        if (newFailureCount >= 3) {
          setPollError(true)
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)

          // Resume polling after 30 seconds
          pollTimeoutRef.current = setTimeout(() => {
            setPollError(false)
            setFailureCount(0)
            initialFetch()
            pollingIntervalRef.current = setInterval(async () => {
              const pollData = await fetchPollData()
              if (pollData) {
                const stats = convertPollDataToStats(pollData)
                setPollStats(stats)
                setFailureCount(0)
              } else {
                setFailureCount((prev) => prev + 1)
              }
            }, SOLANA_CONFIG.POLL_INTERVAL)
          }, 30000)
        }
      }
    }, SOLANA_CONFIG.POLL_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
  }, [failureCount])

  const handleVote = async (choiceIndex: number) => {
    if (!publicKey) {
      console.error("Wallet not connected")
      return
    }

    if (!sendTransaction) {
      console.error("sendTransaction is not available in this wallet")
      return
    }

    try {
      setIsVoting(true)

      const txSignature = await submitVoteToSolana(publicKey, choiceIndex, sendTransaction)

      const voteData: VoteData = {
        pollId,
        choiceIndex,
        voter: publicKey.toBase58(),
        timestamp: Date.now(),
        txSignature: txSignature || undefined,
      }

      // Store vote in localStorage
      const walletKey = publicKey.toBase58()
      try {
        const stored = localStorage.getItem(`votes_${walletKey}`)
        const arr = stored ? JSON.parse(stored) : []
        if (Array.isArray(arr)) {
          arr.push(voteData)
          localStorage.setItem(`votes_${walletKey}`, JSON.stringify(arr))
        }
      } catch (e) {
        // ignore storage errors
      }

      setVoteConfirmation(voteData)
      setUserVotes((prev) => prev + 1)

      // Clear confirmation after 3 seconds
      setTimeout(() => setVoteConfirmation(null), 3000)

      console.log("Vote submitted successfully!", voteData)
    } catch (error) {
      console.error("Error submitting vote:", error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="App">
      <ParticleBackground />

      <header className="App-header">
        <h1>Solana Voting</h1>
        <p>Decentralized governance at light speed</p>

        <WalletMultiButton />
      </header>

      <main className="App-main">
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-value">{pollStats.total}</span>
            <span className="stat-label">Total Votes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{userVotes}</span>
            <span className="stat-label">Your Votes</span>
          </div>
        </div>

        {pollError && <div className="error-message">⚠ Connection paused - retrying in 30 seconds</div>}

        {!publicKey && <div className="warning-message">Connect your wallet to participate</div>}

        {publicKey && (
          <>
            <StatsDisplay stats={pollStats} options={options} />

            <div className="poll-cards-container">
              {options.map((option, idx) => (
                <PollCard
                  key={idx}
                  pollId={pollId}
                  options={[option]}
                  onVote={() => handleVote(idx)}
                  isVoting={isVoting}
                  stats={{ total: pollStats.total, distribution: [pollStats.distribution[idx]] }}
                />
              ))}
            </div>

            {voteConfirmation && (
              <div className="vote-confirmation">
                <span>✓ Vote Cast Successfully!</span>
                <span>{options[voteConfirmation.choiceIndex].title}</span>
                {voteConfirmation.txSignature && (
                  <span className="tx-sig">TX: {voteConfirmation.txSignature.slice(0, 8)}...</span>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="App-footer">Solana Devnet • Blockchain Voting</footer>
    </div>
  )
}
