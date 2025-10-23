import { Trophy } from 'lucide-react'

const ACHIEVEMENT_DATA: Record<string, { name: string; icon: string; rarity: string }> = {
  FIRST_STEPS: { name: 'First Steps', icon: '🥚', rarity: 'Common' },
  METAMORPHOSIS: { name: 'Metamorphosis', icon: '🦋', rarity: 'Rare' },
  DEATH_SURVIVOR: { name: 'Death Survivor', icon: '💀', rarity: 'Rare' },
  TRIPLE_EVOLUTION: { name: 'Triple Evolution', icon: '🌟', rarity: 'Epic' },
  PERFECTIONIST: { name: 'Perfectionist', icon: '💯', rarity: 'Epic' },
  STREAK_MASTER: { name: 'Streak Master', icon: '🔥', rarity: 'Uncommon' },
  ACTIVE_PLAYER: { name: 'Active Player', icon: '🎮', rarity: 'Uncommon' },
  LEGEND: { name: 'Legend', icon: '👑', rarity: 'Legendary' },
}

interface AchievementToastProps {
  achievementId: string
  onClose: () => void
}

export function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
  const achievement = ACHIEVEMENT_DATA[achievementId]
  
  if (!achievement) return null

  return (
    <div className="achievement-toast" onClick={onClose}>
      <div className="toast-content">
        <div className="toast-icon">
          <Trophy size={24} />
        </div>
        <div className="toast-details">
          <div className="toast-title">Achievement Unlocked!</div>
          <div className="toast-achievement">
            <span className="achievement-emoji">{achievement.icon}</span>
            <span className="achievement-name">{achievement.name}</span>
          </div>
          <div className={`toast-rarity rarity-${achievement.rarity.toLowerCase()}`}>
            {achievement.rarity}
          </div>
        </div>
      </div>
    </div>
  )
}
