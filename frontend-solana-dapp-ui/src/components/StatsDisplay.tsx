"use client"

interface StatsDisplayProps {
  stats: { total: number; distribution: number[] }
  options: { title: string; emoji: string; description: string }[]
}

export function StatsDisplay({ stats, options }: StatsDisplayProps) {
  return (
    <div className="stats-display">
      <div className="stats-grid">
        {options.map((option, index) => (
          <div key={index} className="stat-card">
            <div className="stat-emoji">{option.emoji}</div>
            <p className="stat-count">{stats.distribution[index] || 0}</p>
            <p className="stat-name">{option.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

