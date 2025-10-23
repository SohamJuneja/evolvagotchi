import React, { useEffect, useState } from 'react';
import type { Achievement } from '../services/achievementService';
import { RARITY_GRADIENTS } from '../services/achievementService';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div
        className="notification-content"
        style={{ background: RARITY_GRADIENTS[achievement.rarity] }}
      >
        <div className="notification-header">
          <span className="notification-title">🎉 Achievement Unlocked!</span>
          <button className="notification-close" onClick={() => setIsVisible(false)}>
            ×
          </button>
        </div>
        <div className="notification-body">
          <div className="notification-icon">{achievement.icon}</div>
          <div className="notification-details">
            <div className="notification-name">{achievement.name}</div>
            <div className="notification-rarity">{achievement.rarity}</div>
            <div className="notification-description">{achievement.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
