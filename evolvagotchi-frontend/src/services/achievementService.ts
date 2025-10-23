// Achievement contract address
export const ACHIEVEMENT_CONTRACT_ADDRESS = '0x02158149cd9b7ecE0D1dff4E1edA273c098D98f0';

// Achievement interface
export interface Achievement {
  id: number;
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  icon: string;
  totalEarned: number;
  earned: boolean; // User-specific
}

// Rarity colors
export const RARITY_COLORS = {
  Common: '#9CA3AF',
  Uncommon: '#10B981',
  Rare: '#3B82F6',
  Epic: '#A855F7',
  Legendary: '#F59E0B',
};

// Rarity gradients
export const RARITY_GRADIENTS = {
  Common: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
  Uncommon: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  Rare: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  Epic: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
  Legendary: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
};

// Achievement ABI (using proper format for viem)
export const ACHIEVEMENT_ABI = [
  {
    inputs: [],
    name: 'getAllAchievements',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'rarity', type: 'string' },
          { name: 'icon', type: 'string' },
          { name: 'totalEarned', type: 'uint256' },
        ],
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAchievements',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'petTokenId', type: 'uint256' }],
    name: 'getPetAchievements',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'achievementId', type: 'uint256' },
    ],
    name: 'hasEarned',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAchievementCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'petTokenId', type: 'uint256' },
    ],
    name: 'recordFirstPet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'petTokenId', type: 'uint256' },
    ],
    name: 'recordFeed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'petTokenId', type: 'uint256' },
    ],
    name: 'recordPlay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'petTokenId', type: 'uint256' },
      { name: 'stage', type: 'uint256' },
    ],
    name: 'recordEvolution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'petTokenId', type: 'uint256' },
    ],
    name: 'recordRevival',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'petTokenId', type: 'uint256' },
    ],
    name: 'recordPerfectStats',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'achievementId', type: 'uint256' },
      { indexed: false, name: 'petTokenId', type: 'uint256' },
      { indexed: false, name: 'name', type: 'string' },
    ],
    name: 'AchievementEarned',
    type: 'event',
  },
] as const;

/**
 * Parse achievement from contract response
 */
export function parseAchievement(data: any, earned: boolean = false): Achievement {
  return {
    id: Number(data.id),
    name: data.name,
    description: data.description,
    rarity: data.rarity as Achievement['rarity'],
    icon: data.icon,
    totalEarned: Number(data.totalEarned),
    earned,
  };
}

/**
 * Get rarity display with emoji
 */
export function getRarityDisplay(rarity: Achievement['rarity']): string {
  const rarityEmojis = {
    Common: '⚪',
    Uncommon: '🟢',
    Rare: '🔵',
    Epic: '🟣',
    Legendary: '🟡',
  };
  return `${rarityEmojis[rarity]} ${rarity}`;
}

/**
 * Calculate achievement progress for trackable achievements
 */
export function getAchievementProgress(achievementId: number, stats: {
  feedCount?: number;
  playCount?: number;
  evolutionStage?: number;
}): { current: number; target: number; percentage: number } | null {
  const progressMap: Record<number, { target: number; getValue: (stats: any) => number }> = {
    5: { target: 10, getValue: (s) => s.feedCount || 0 }, // Streak Master
    6: { target: 10, getValue: (s) => s.playCount || 0 }, // Active Player
  };

  const progress = progressMap[achievementId];
  if (!progress) return null;

  const current = progress.getValue(stats);
  const percentage = Math.min((current / progress.target) * 100, 100);

  return { current, target: progress.target, percentage };
}

/**
 * Sort achievements by rarity (Legendary first)
 */
export function sortAchievementsByRarity(achievements: Achievement[]): Achievement[] {
  const rarityOrder = { Legendary: 0, Epic: 1, Rare: 2, Uncommon: 3, Common: 4 };
  return [...achievements].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
}

/**
 * Filter achievements by earned status
 */
export function filterAchievements(
  achievements: Achievement[],
  filter: 'all' | 'earned' | 'locked'
): Achievement[] {
  if (filter === 'all') return achievements;
  if (filter === 'earned') return achievements.filter((a) => a.earned);
  return achievements.filter((a) => !a.earned);
}

/**
 * Get achievement stats summary
 */
export function getAchievementStats(achievements: Achievement[]): {
  total: number;
  earned: number;
  percentage: number;
  byRarity: Record<Achievement['rarity'], { earned: number; total: number }>;
} {
  const total = achievements.length;
  const earned = achievements.filter((a) => a.earned).length;
  const percentage = total > 0 ? (earned / total) * 100 : 0;

  const byRarity: Record<Achievement['rarity'], { earned: number; total: number }> = {
    Common: { earned: 0, total: 0 },
    Uncommon: { earned: 0, total: 0 },
    Rare: { earned: 0, total: 0 },
    Epic: { earned: 0, total: 0 },
    Legendary: { earned: 0, total: 0 },
  };

  achievements.forEach((achievement) => {
    byRarity[achievement.rarity].total++;
    if (achievement.earned) {
      byRarity[achievement.rarity].earned++;
    }
  });

  return { total, earned, percentage, byRarity };
}
