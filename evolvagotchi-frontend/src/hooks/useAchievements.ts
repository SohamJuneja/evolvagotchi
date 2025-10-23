import { useState, useEffect } from 'react'

interface AchievementProgress {
  feedCount: number
  playCount: number
  hasFirstPet: boolean
  hasRevived: boolean
  hasEvolved: boolean
  hasReachedTeen: boolean
  hasReachedAdult: boolean
  hasPerfectStats: boolean
}

const STORAGE_KEY = 'evolvagotchi_achievements'

// Track progress in localStorage (off-chain)
export function useAchievements(tokenId: number, address?: string) {
  const [progress, setProgress] = useState<AchievementProgress>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${address}_${tokenId}`)
    return stored ? JSON.parse(stored) : {
      feedCount: 0,
      playCount: 0,
      hasFirstPet: false,
      hasRevived: false,
      hasEvolved: false,
      hasReachedTeen: false,
      hasReachedAdult: false,
      hasPerfectStats: false,
    }
  })

  const [newAchievements, setNewAchievements] = useState<string[]>([])

  useEffect(() => {
    if (address) {
      localStorage.setItem(`${STORAGE_KEY}_${address}_${tokenId}`, JSON.stringify(progress))
    }
  }, [progress, address, tokenId])

  const checkAchievement = (type: string, condition: boolean) => {
    if (condition) {
      setNewAchievements(prev => [...prev, type])
      // Show notification
      setTimeout(() => {
        setNewAchievements(prev => prev.filter(a => a !== type))
      }, 5000)
    }
  }

  const recordFeed = () => {
    setProgress(prev => {
      const newCount = prev.feedCount + 1
      checkAchievement('STREAK_MASTER', newCount === 10)
      return { ...prev, feedCount: newCount }
    })
  }

  const recordPlay = () => {
    setProgress(prev => {
      const newCount = prev.playCount + 1
      checkAchievement('ACTIVE_PLAYER', newCount === 10)
      return { ...prev, playCount: newCount }
    })
  }

  const recordFirstPet = () => {
    if (!progress.hasFirstPet) {
      setProgress(prev => ({ ...prev, hasFirstPet: true }))
      checkAchievement('FIRST_STEPS', true)
    }
  }

  const recordRevival = () => {
    if (!progress.hasRevived) {
      setProgress(prev => ({ ...prev, hasRevived: true }))
      checkAchievement('DEATH_SURVIVOR', true)
    }
  }

  const recordEvolution = (stage: number) => {
    setProgress(prev => {
      const updates: Partial<AchievementProgress> = {}
      
      if (stage >= 1 && !prev.hasEvolved) {
        updates.hasEvolved = true
        checkAchievement('METAMORPHOSIS', true)
      }
      if (stage >= 2 && !prev.hasReachedTeen) {
        updates.hasReachedTeen = true
        checkAchievement('TRIPLE_EVOLUTION', true)
      }
      if (stage >= 3 && !prev.hasReachedAdult) {
        updates.hasReachedAdult = true
        checkAchievement('LEGEND', true)
      }
      
      return { ...prev, ...updates }
    })
  }

  const recordPerfectStats = () => {
    if (!progress.hasPerfectStats) {
      setProgress(prev => ({ ...prev, hasPerfectStats: true }))
      checkAchievement('PERFECTIONIST', true)
    }
  }

  return {
    progress,
    newAchievements,
    recordFeed,
    recordPlay,
    recordFirstPet,
    recordRevival,
    recordEvolution,
    recordPerfectStats,
  }
}
