import type { GameEvent } from '../services/eventService'
import { Sparkles, Gift, Cloud, Heart, Trophy } from 'lucide-react'

interface EventNotificationProps {
  event: GameEvent
  onClose: () => void
}

const EVENT_ICONS = {
  treasure: Gift,
  encounter: Sparkles,
  weather: Cloud,
  mood: Heart,
  milestone: Trophy,
}

const EVENT_COLORS = {
  treasure: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
  encounter: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  weather: 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)',
  mood: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  milestone: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
}

export function EventNotification({ event, onClose }: EventNotificationProps) {
  const Icon = EVENT_ICONS[event.type]
  const bgColor = EVENT_COLORS[event.type]

  const effectText = []
  if (event.effect.happiness && event.effect.happiness !== 0) {
    effectText.push(`${event.effect.happiness > 0 ? '+' : ''}${event.effect.happiness} Happiness`)
  }
  if (event.effect.hunger && event.effect.hunger !== 0) {
    effectText.push(`${event.effect.hunger > 0 ? '+' : ''}${event.effect.hunger} Hunger`)
  }
  if (event.effect.health && event.effect.health !== 0) {
    effectText.push(`${event.effect.health > 0 ? '+' : ''}${event.effect.health} Health`)
  }

  return (
    <div className="event-notification" onClick={onClose}>
      <div className="event-card" style={{ background: bgColor }}>
        <div className="event-icon">
          <Icon size={32} />
        </div>
        <div className="event-content">
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          {effectText.length > 0 && (
            <div className="event-effects">
              {effectText.map((effect, i) => (
                <span key={i} className="effect-badge">{effect}</span>
              ))}
            </div>
          )}
        </div>
        <button className="event-close" onClick={onClose}>×</button>
      </div>
    </div>
  )
}