/**
 * AI Health Advisor Service
 * Provides proactive health predictions and guidance
 */

export interface PetStats {
  health: number
  happiness: number
  hunger: number
  age: number
  evolutionStage: number
  isDead?: boolean
}

export interface HealthPrediction {
  urgency: 'critical' | 'warning' | 'info' | 'good'
  message: string
  icon: string
  timeframe?: string
  action?: string
  details?: string
}

const BLOCKS_PER_SECOND = 6
const BLOCKS_PER_HUNGER_POINT = 500  // ~78 seconds per hunger point
// const BLOCKS_PER_HAPPINESS_DECAY = 1000  // ~156 seconds per happiness point (for future use)

// Evolution thresholds (in blocks)
const EGG_TO_BABY_BLOCKS = 25000      // ~1.1 hours
const BABY_TO_TEEN_BLOCKS = 100000    // ~4.3 hours
const TEEN_TO_ADULT_BLOCKS = 300000   // ~13 hours
const EVOLUTION_HAPPINESS_THRESHOLD = 60

/**
 * Calculate time until stat reaches a certain value
 */
function timeUntilStatChange(currentValue: number, targetValue: number, decayRate: number): number {
  if (currentValue >= targetValue) {
    return 0
  }
  const pointsNeeded = targetValue - currentValue
  const blocksNeeded = pointsNeeded * decayRate
  return Math.floor(blocksNeeded / BLOCKS_PER_SECOND) // seconds
}

/**
 * Format seconds into human-readable time
 */
function formatTime(seconds: number): string {
  // Round to whole seconds
  seconds = Math.floor(seconds)
  
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

/**
 * Check if pet can evolve
 */
function canEvolve(stats: PetStats): { canEvolve: boolean; reason?: string; blocksNeeded?: number } {
  const { age, evolutionStage, happiness, health } = stats
  
  if (evolutionStage === 0) {
    // Egg to Baby - only needs age
    if (age >= EGG_TO_BABY_BLOCKS) {
      return { canEvolve: true }
    }
    return { 
      canEvolve: false, 
      reason: 'Need more time',
      blocksNeeded: EGG_TO_BABY_BLOCKS - age
    }
  } else if (evolutionStage === 1) {
    // Baby to Teen - needs age and happiness
    if (age < BABY_TO_TEEN_BLOCKS) {
      return { 
        canEvolve: false, 
        reason: 'Need more time',
        blocksNeeded: BABY_TO_TEEN_BLOCKS - age
      }
    }
    if (happiness < EVOLUTION_HAPPINESS_THRESHOLD) {
      return { 
        canEvolve: false, 
        reason: `Need happiness ≥ ${EVOLUTION_HAPPINESS_THRESHOLD} (currently ${happiness})`
      }
    }
    return { canEvolve: true }
  } else if (evolutionStage === 2) {
    // Teen to Adult - needs age, happiness, and health
    if (age < TEEN_TO_ADULT_BLOCKS) {
      return { 
        canEvolve: false, 
        reason: 'Need more time',
        blocksNeeded: TEEN_TO_ADULT_BLOCKS - age
      }
    }
    if (happiness < EVOLUTION_HAPPINESS_THRESHOLD) {
      return { 
        canEvolve: false, 
        reason: `Need happiness ≥ ${EVOLUTION_HAPPINESS_THRESHOLD} (currently ${happiness})`
      }
    }
    if (health < 80) {
      return { 
        canEvolve: false, 
        reason: `Need health ≥ 80 (currently ${health})`
      }
    }
    return { canEvolve: true }
  }
  
  return { canEvolve: false, reason: 'Already at max evolution' }
}

/**
 * Predict when health will be dangerously low
 */
function predictHealthDanger(stats: PetStats): { isDanger: boolean; timeframe?: string } {
  const { hunger, health } = stats
  
  // Health decreases when hunger > 80
  if (hunger > 80) {
    // Already losing health
    const healthDecrease = (hunger - 80) / 5
    const blocksUntilZero = Math.floor(health / healthDecrease) * BLOCKS_PER_HUNGER_POINT
    const secondsUntilZero = blocksUntilZero / BLOCKS_PER_SECOND
    
    if (secondsUntilZero < 300) { // Less than 5 minutes
      return { isDanger: true, timeframe: formatTime(secondsUntilZero) }
    }
  } else {
    // Calculate when hunger will reach 80
    const hungerPointsToReach80 = 80 - hunger
    if (hungerPointsToReach80 > 0) {
      const blocksUntilDanger = hungerPointsToReach80 * BLOCKS_PER_HUNGER_POINT
      const secondsUntilDanger = blocksUntilDanger / BLOCKS_PER_SECOND
      
      if (secondsUntilDanger < 600) { // Less than 10 minutes
        return { isDanger: true, timeframe: formatTime(secondsUntilDanger) }
      }
    }
  }
  
  return { isDanger: false }
}

/**
 * Main health analysis function
 */
export function analyzeHealth(stats: PetStats): HealthPrediction[] {
  const predictions: HealthPrediction[] = []
  
  // Check if pet is dead
  if (stats.isDead) {
    predictions.push({
      urgency: 'critical',
      message: '💀 Your pet has died',
      icon: '👻',
      action: 'Revive your pet to continue playing',
      details: 'Pay 0.005 STT to bring your pet back to life with partial stats.'
    })
    return predictions
  }
  
  // CRITICAL: Death imminent
  if (stats.health <= 20 && stats.hunger >= 80) {
    const danger = predictHealthDanger(stats)
    predictions.push({
      urgency: 'critical',
      message: '⚠️ CRITICAL: Your pet will die soon!',
      icon: '🚨',
      timeframe: danger.timeframe,
      action: 'Feed immediately and update stats!',
      details: `Health is critically low at ${stats.health}. High hunger (${stats.hunger}) is causing rapid health loss.`
    })
  } else if (stats.health <= 20) {
    predictions.push({
      urgency: 'critical',
      message: '⚠️ CRITICAL: Health is dangerously low!',
      icon: '🚨',
      action: 'Feed your pet multiple times to restore health',
      details: `Health at ${stats.health}. Keep hunger below 80 to prevent further damage.`
    })
  }
  
  // WARNING: Health declining
  if (stats.hunger >= 70 && stats.hunger < 80 && stats.health > 20) {
    const timeUntilDanger = timeUntilStatChange(stats.hunger, 80, BLOCKS_PER_HUNGER_POINT)
    predictions.push({
      urgency: 'warning',
      message: '⚠️ High hunger will damage health soon!',
      icon: '🍖',
      timeframe: `in ${formatTime(timeUntilDanger)}`,
      action: 'Feed your pet soon',
      details: `Hunger at ${stats.hunger}. When it reaches 80, health will start decreasing.`
    })
  }
  
  // WARNING: Happiness very low
  if (stats.happiness <= 30) {
    predictions.push({
      urgency: 'warning',
      message: '😢 Your pet is very unhappy',
      icon: '💔',
      action: 'Play with your pet to boost happiness',
      details: `Happiness at ${stats.happiness}. Happy pets are healthier and can evolve!`
    })
  }
  
  // INFO: Evolution available
  const evolutionCheck = canEvolve(stats)
  if (evolutionCheck.canEvolve) {
    predictions.push({
      urgency: 'info',
      message: '✨ Your pet is ready to evolve!',
      icon: '🎉',
      action: 'Update stats to trigger evolution',
      details: 'All evolution requirements are met. Evolution happens automatically when you update stats.'
    })
  } else if (evolutionCheck.blocksNeeded) {
    const secondsNeeded = evolutionCheck.blocksNeeded / BLOCKS_PER_SECOND
    if (secondsNeeded < 3600) { // Less than 1 hour
      predictions.push({
        urgency: 'info',
        message: '🥚 Evolution coming soon!',
        icon: '⏰',
        timeframe: `in ${formatTime(secondsNeeded)}`,
        details: evolutionCheck.reason || 'Keep your pet healthy and happy!'
      })
    }
  }
  
  // INFO: Hunger increasing
  if (stats.hunger >= 50 && stats.hunger < 70) {
    const timeUntilHigh = timeUntilStatChange(stats.hunger, 70, BLOCKS_PER_HUNGER_POINT)
    predictions.push({
      urgency: 'info',
      message: '🍽️ Hunger is rising',
      icon: '📈',
      timeframe: `${formatTime(timeUntilHigh)} until 70`,
      details: `Current hunger: ${stats.hunger}. Feed regularly to keep your pet healthy.`
    })
  }
  
  // GOOD: Everything is fine
  if (predictions.length === 0) {
    predictions.push({
      urgency: 'good',
      message: '✅ Your pet is healthy and happy!',
      icon: '😊',
      details: `Health: ${stats.health}, Happiness: ${stats.happiness}, Hunger: ${stats.hunger}. Keep up the great work!`
    })
  }
  
  return predictions
}

/**
 * Get optimal action recommendation
 */
export function getOptimalAction(stats: PetStats): string {
  if (stats.isDead) {
    return 'Revive your pet'
  }
  
  if (stats.health <= 20) {
    return 'Feed immediately (Critical!)'
  }
  
  if (stats.hunger >= 70) {
    return 'Feed soon'
  }
  
  if (stats.happiness <= 30) {
    return 'Play with your pet'
  }
  
  const evolutionCheck = canEvolve(stats)
  if (evolutionCheck.canEvolve) {
    return 'Update stats to evolve'
  }
  
  if (stats.hunger >= 50) {
    return 'Feed when convenient'
  }
  
  return 'All good! Check back later'
}

/**
 * Calculate health trend (improving, declining, stable)
 */
export function getHealthTrend(stats: PetStats): 'improving' | 'declining' | 'stable' {
  if (stats.hunger > 80 && stats.health < 100) {
    return 'declining'
  }
  
  if (stats.hunger < 30 && stats.happiness > 70 && stats.health < 100) {
    return 'improving'
  }
  
  return 'stable'
}
