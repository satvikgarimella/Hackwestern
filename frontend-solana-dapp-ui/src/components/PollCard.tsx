"use client"

import { useState } from "react"

interface PollCardProps {
  pollId: number
  options: { title: string; emoji: string; description: string }[]
  onVote: (choiceIndex: number) => void
  isVoting: boolean
  stats: { total: number; distribution: number[] }
}

export function PollCard({ pollId, options, onVote, isVoting, stats }: PollCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const totalVotes = stats.distribution.reduce((a, b) => a + b, 0) || 1
  const percentages = stats.distribution.map((v) => Math.round((v / totalVotes) * 100))

  return (
    <div className="poll-card">
      <div className="poll-header">
        <h3 className="poll-title">Poll #{pollId}</h3>
        <p className="poll-question">Which option do you prefer?</p>
      </div>

      <div className="options-container">
        {options.map((option, index) => (
          <div
            key={index}
            className={`vote-option ${hoveredIndex === index ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <button onClick={() => onVote(index)} disabled={isVoting} className="vote-btn">
              <span className="option-emoji">{option.emoji}</span>
              <div className="option-content">
                <p className="option-title">{option.title}</p>
                <p className="option-description">{option.description}</p>
              </div>
              <div className="vote-count">{stats.distribution[index] || 0}</div>
            </button>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percentages[index]}%` }} />
            </div>
            <p className="percentage">{percentages[index]}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// src/components/PollQuestions.tsx
import { MOCK_POLLS } from "../data/polls";

function PollQuestions() {
  return (
    <div>
      {MOCK_POLLS.map((poll) => (
        <div key={poll.id}>
          <h2>{poll.question}</h2>
          {poll.options.map((opt) => (
            <button key={opt.id}>
              {opt.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PollQuestions;

