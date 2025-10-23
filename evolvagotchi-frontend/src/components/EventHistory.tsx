import { useState, useEffect } from 'react'
import { History, TrendingUp, TrendingDown } from 'lucide-react'
import { getPendingEvents, getEventCount, hasPendingEvents } from '../services/eventStorage'

interface EventHistoryProps {
  tokenId: number
  onSync: () => void
  isSyncing: boolean
  onClose?: () => void
}

export default function EventHistory({ tokenId, onSync, isSyncing, onClose }: EventHistoryProps) {
  const pending = getPendingEvents(tokenId)
  const hasEvents = hasPendingEvents(tokenId)
  const eventCount = getEventCount(tokenId)

  // Auto-dismiss timer for empty state
  const [showEmpty, setShowEmpty] = useState(true)
  useEffect(() => {
    if (!hasEvents && showEmpty) {
      const timer = setTimeout(() => {
        setShowEmpty(false)
        if (onClose) onClose()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [hasEvents, showEmpty, onClose])

  if (!hasEvents && showEmpty) {
    return (
      <div className="event-history empty">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <History size={24} />
          {onClose && (
            <button className="btn btn-small btn-close" onClick={() => { setShowEmpty(false); onClose(); }} aria-label="Close">×</button>
          )}
        </div>
        <p>No pending events</p>
        <small>Events will appear here as they happen!</small>
      </div>
    )
  }

  // Format effect value (for future use)
  // const formatEffect = (value: number) => {
  //   if (value === 0) return null
  //   const sign = value > 0 ? '+' : ''
  //   return `${sign}${Math.abs(value)}`
  // }

  return (
    <div className="event-history">
      <div className="history-header">
        <div className="header-title">
          <History size={20} />
          <h4>Recent Events ({eventCount})</h4>
        </div>
        <button 
          className="btn btn-sync" 
          onClick={onSync}
          disabled={isSyncing}
        >
          {isSyncing ? '⏳ Syncing...' : '🔄 Sync to Blockchain'}
        </button>
      </div>

      <div className="pending-summary">
        <h5>📊 Pending Changes:</h5>
        <div className="summary-stats">
          {pending.totalHappiness !== 0 && (
            <span className={pending.totalHappiness > 0 ? 'positive' : 'negative'}>
              {pending.totalHappiness > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              Happiness: {pending.totalHappiness > 0 ? '+' : ''}{pending.totalHappiness}
            </span>
          )}
          {pending.totalHunger !== 0 && (
            <span className={pending.totalHunger < 0 ? 'positive' : 'negative'}>
              {pending.totalHunger < 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              Hunger: {pending.totalHunger > 0 ? '+' : ''}{pending.totalHunger}
            </span>
          )}
          {pending.totalHealth !== 0 && (
            <span className={pending.totalHealth > 0 ? 'positive' : 'negative'}>
              {pending.totalHealth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              Health: {pending.totalHealth > 0 ? '+' : ''}{pending.totalHealth}
            </span>
          )}
        </div>
      </div>

      <div className="event-list">
        {pending.events.slice().reverse().map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-item-header">
              <span className="event-title">{event.title}</span>
              <span className="event-time">
                {new Date(event.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <p className="event-description">{event.description}</p>
            <div className="event-effects-mini">
              {(event.effect.happiness ?? 0) !== 0 && (
                <span>😊 {(event.effect.happiness ?? 0) > 0 ? '+' : ''}{event.effect.happiness ?? 0}</span>
              )}
              {(event.effect.hunger ?? 0) !== 0 && (
                <span className={(event.effect.hunger ?? 0) < 0 ? 'positive' : 'negative'}>
                  🍖 {(event.effect.hunger ?? 0) > 0 ? '+' : ''}{event.effect.hunger ?? 0}
                </span>
              )}
              {(event.effect.health ?? 0) !== 0 && (
                <span>❤️ {(event.effect.health ?? 0) > 0 ? '+' : ''}{event.effect.health ?? 0}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}