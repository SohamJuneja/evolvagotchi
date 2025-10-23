import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import type { Achievement } from '../services/achievementService';
import {
  ACHIEVEMENT_CONTRACT_ADDRESS,
  ACHIEVEMENT_ABI,
  parseAchievement,
  sortAchievementsByRarity,
  filterAchievements,
  getAchievementStats,
  RARITY_GRADIENTS,
} from '../services/achievementService';
import AchievementBadge from './AchievementBadge';

interface AchievementGalleryProps {
  petTokenId?: bigint;
  compact?: boolean;
}

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({
  petTokenId,
  compact = false,
}) => {
  const { address } = useAccount();
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Fetch all achievements
  const { data: allAchievementsData } = useReadContract({
    address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
    abi: ACHIEVEMENT_ABI,
    functionName: 'getAllAchievements',
  });

  // Fetch user's earned achievements
  const { data: userAchievements } = useReadContract({
    address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
    abi: ACHIEVEMENT_ABI,
    functionName: 'getUserAchievements',
    args: address ? [address] : undefined,
  });

  // Fetch pet's achievements if petTokenId provided
  const { data: petAchievements } = useReadContract({
    address: ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}`,
    abi: ACHIEVEMENT_ABI,
    functionName: 'getPetAchievements',
    args: petTokenId ? [petTokenId] : undefined,
  });

  useEffect(() => {
    if (allAchievementsData) {
      const achievementIds = (petTokenId ? petAchievements : userAchievements) as bigint[] | undefined;
      const earnedIds = new Set(
        achievementIds?.map((id) => Number(id)) || []
      );

      const parsedAchievements = (allAchievementsData as any[]).map((ach) =>
        parseAchievement(ach, earnedIds.has(Number(ach.id)))
      );

      setAchievements(sortAchievementsByRarity(parsedAchievements));
    }
  }, [allAchievementsData, userAchievements, petAchievements, petTokenId]);

  const filteredAchievements = filterAchievements(achievements, filter);
  const stats = getAchievementStats(achievements);

  if (compact) {
    // Compact view for PetDetail - show only earned badges
    const earnedBadges = achievements.filter((a) => a.earned);
    if (earnedBadges.length === 0) return null;

    return (
      <div className="achievements-compact">
        <div className="achievements-header-compact">
          <span>🏆 Achievements ({earnedBadges.length})</span>
        </div>
        <div className="badges-row">
          {earnedBadges.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} size="medium" />
          ))}
        </div>
      </div>
    );
  }

  // Full gallery view
  return (
    <div className="achievement-gallery">
      <div className="gallery-header">
        <h2>🏆 Achievement Gallery</h2>
        <div className="achievement-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.earned}/{stats.total}</div>
            <div className="stat-label">Unlocked</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.percentage)}%</div>
            <div className="stat-label">Complete</div>
          </div>
        </div>
      </div>

      <div className="gallery-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({achievements.length})
        </button>
        <button
          className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
          onClick={() => setFilter('earned')}
        >
          Earned ({stats.earned})
        </button>
        <button
          className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
          onClick={() => setFilter('locked')}
        >
          Locked ({stats.total - stats.earned})
        </button>
      </div>

      <div className="achievement-grid">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            style={{
              background: achievement.earned
                ? RARITY_GRADIENTS[achievement.rarity]
                : 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
            }}
          >
            <div className="achievement-icon-large">{achievement.earned ? achievement.icon : '🔒'}</div>
            <div className="achievement-details">
              <h3>{achievement.earned ? achievement.name : '???'}</h3>
              <p className="achievement-description">
                {achievement.earned ? achievement.description : 'Complete the challenge to unlock!'}
              </p>
              <div className="achievement-rarity-badge" style={{ opacity: achievement.earned ? 1 : 0.5 }}>
                {achievement.earned ? achievement.rarity : 'Locked'}
              </div>
              {achievement.earned && achievement.totalEarned > 0 && (
                <div className="achievement-earned-count">
                  Earned by {achievement.totalEarned} {achievement.totalEarned === 1 ? 'player' : 'players'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="no-achievements">
          <p>No {filter} achievements to display</p>
        </div>
      )}
    </div>
  );
};

export default AchievementGallery;
