import { useState, useEffect } from 'react'
import { X, TrendingUp } from 'lucide-react'
import { getPetHistory, getMilestones, formatTimestamp, type HistoryEvent } from '../services/petHistory'

interface PetTimelineProps {
  tokenId: number
  petName: string
  onClose: () => void
}

export function PetTimeline({ tokenId, petName, onClose }: PetTimelineProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [milestones, setMilestones] = useState({
    totalFeeds: 0,
    totalPlays: 0,
    totalEvolutions: 0,
    totalEvents: 0,
    longestStreak: 0,
  })
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadHistory()
  }, [tokenId])

  const loadHistory = () => {
    const data = getPetHistory(tokenId)
    setHistory(data)
    setMilestones(getMilestones(tokenId))
  }

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(e => e.type === filter)

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'birth': return '#4caf50'
      case 'evolution': return '#9c27b0'
      case 'feed': return '#ff9800'
      case 'play': return '#2196f3'
      case 'random-event': return '#00bcd4'
      case 'death': return '#f44336'
      case 'revival': return '#8bc34a'
      case 'health-milestone': return '#ff5722'
      default: return '#757575'
    }
  }

  return (
    <div className="timeline-overlay">
      <div className="timeline-modal">
        <div className="timeline-header">
          <div>
            <h2>📜 {petName}'s Timeline</h2>
            <p className="timeline-subtitle">Complete history of {petName}'s journey</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Milestones Summary */}
        <div className="milestones-grid">
          <div className="milestone-card">
            <div className="milestone-icon">🍖</div>
            <div className="milestone-value">{milestones.totalFeeds}</div>
            <div className="milestone-label">Times Fed</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-icon">🎮</div>
            <div className="milestone-value">{milestones.totalPlays}</div>
            <div className="milestone-label">Times Played</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-icon">✨</div>
            <div className="milestone-value">{milestones.totalEvolutions}</div>
            <div className="milestone-label">Evolutions</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-icon">🎲</div>
            <div className="milestone-value">{milestones.totalEvents}</div>
            <div className="milestone-label">Random Events</div>
          </div>
          <div className="milestone-card">
            <div className="milestone-icon">🔥</div>
            <div className="milestone-value">{milestones.longestStreak}</div>
            <div className="milestone-label">Day Streak</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="timeline-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({history.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'evolution' ? 'active' : ''}`}
            onClick={() => setFilter('evolution')}
          >
            ✨ Evolutions
          </button>
          <button 
            className={`filter-btn ${filter === 'feed' ? 'active' : ''}`}
            onClick={() => setFilter('feed')}
          >
            🍖 Feeds
          </button>
          <button 
            className={`filter-btn ${filter === 'play' ? 'active' : ''}`}
            onClick={() => setFilter('play')}
          >
            🎮 Plays
          </button>
          <button 
            className={`filter-btn ${filter === 'random-event' ? 'active' : ''}`}
            onClick={() => setFilter('random-event')}
          >
            🎲 Events
          </button>
        </div>

        {/* Timeline List */}
        <div className="timeline-list">
          {filteredHistory.length === 0 ? (
            <div className="timeline-empty">
              <TrendingUp size={48} color="#ccc" />
              <p>No events yet. Start caring for {petName}!</p>
            </div>
          ) : (
            filteredHistory.map((event) => (
              <div key={event.id} className="timeline-item">
                <div 
                  className="timeline-icon-wrapper" 
                  style={{ background: getEventColor(event.type) }}
                >
                  <span className="timeline-icon">{event.icon}</span>
                </div>
                <div className="timeline-content">
                  <div className="timeline-item-header">
                    <h3>{event.title}</h3>
                    <span className="timeline-time">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <p className="timeline-description">{event.description}</p>
                  {event.stats && (
                    <div className="timeline-stats">
                      {event.stats.happiness !== undefined && (
                        <span className="stat-badge happiness">💛 {event.stats.happiness}</span>
                      )}
                      {event.stats.hunger !== undefined && (
                        <span className="stat-badge hunger">🍖 {event.stats.hunger}</span>
                      )}
                      {event.stats.health !== undefined && (
                        <span className="stat-badge health">❤️ {event.stats.health}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
