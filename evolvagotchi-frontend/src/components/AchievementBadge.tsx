import React from 'react';
import type { Achievement } from '../services/achievementService';
import { RARITY_COLORS } from '../services/achievementService';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showTooltip = true,
}) => {
  const sizeClasses = {
    small: 'badge-small',
    medium: 'badge-medium',
    large: 'badge-large',
  };

  const badgeClass = achievement.earned ? 'achievement-badge earned' : 'achievement-badge locked';

  return (
    <div
      className={`${badgeClass} ${sizeClasses[size]}`}
      style={{
        borderColor: achievement.earned ? RARITY_COLORS[achievement.rarity] : '#4B5563',
      }}
      title={showTooltip ? `${achievement.name} - ${achievement.description}` : ''}
    >
      <div className="badge-icon" style={{ opacity: achievement.earned ? 1 : 0.3 }}>
        {achievement.earned ? achievement.icon : '🔒'}
      </div>
      {size !== 'small' && (
        <div className="badge-info">
          <div className="badge-name">{achievement.earned ? achievement.name : '???'}</div>
          <div
            className="badge-rarity"
            style={{ color: achievement.earned ? RARITY_COLORS[achievement.rarity] : '#6B7280' }}
          >
            {achievement.earned ? achievement.rarity : 'Locked'}
          </div>
        </div>
      )}
      {achievement.earned && size === 'large' && (
        <div className="badge-description">{achievement.description}</div>
      )}
    </div>
  );
};

export default AchievementBadge;
