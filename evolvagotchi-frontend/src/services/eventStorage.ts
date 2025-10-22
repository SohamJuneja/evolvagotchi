import type { GameEvent } from './eventService'

interface StoredEventEffects {
  tokenId: number
  totalHappiness: number
  totalHunger: number
  totalHealth: number
  events: GameEvent[]
  lastSync: number
}

const STORAGE_KEY = 'evolvagotchi_pending_events'

export function getPendingEvents(tokenId: number): StoredEventEffects {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return createEmptyEffects(tokenId)
    }

    const allEffects: Record<string, StoredEventEffects> = JSON.parse(stored)
    return allEffects[tokenId] || createEmptyEffects(tokenId)
  } catch (error) {
    console.error('Error reading pending events:', error)
    return createEmptyEffects(tokenId)
  }
}

export function addPendingEvent(tokenId: number, event: GameEvent): StoredEventEffects {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allEffects: Record<string, StoredEventEffects> = stored ? JSON.parse(stored) : {}
    
    const current = allEffects[tokenId] || createEmptyEffects(tokenId)
    
    // Add event to history
    current.events.push(event)
    
    // Accumulate stat changes
    current.totalHappiness += event.effect.happiness || 0
    current.totalHunger += event.effect.hunger || 0
    current.totalHealth += event.effect.health || 0
    
    // Save back to storage
    allEffects[tokenId] = current
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEffects))
    
    return current
  } catch (error) {
    console.error('Error adding pending event:', error)
    return createEmptyEffects(tokenId)
  }
}

export function clearPendingEvents(tokenId: number): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const allEffects: Record<string, StoredEventEffects> = JSON.parse(stored)
    delete allEffects[tokenId]
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEffects))
  } catch (error) {
    console.error('Error clearing pending events:', error)
  }
}

export function hasPendingEvents(tokenId: number): boolean {
  const pending = getPendingEvents(tokenId)
  return pending.events.length > 0
}

export function getEventCount(tokenId: number): number {
  const pending = getPendingEvents(tokenId)
  return pending.events.length
}

function createEmptyEffects(tokenId: number): StoredEventEffects {
  return {
    tokenId,
    totalHappiness: 0,
    totalHunger: 0,
    totalHealth: 0,
    events: [],
    lastSync: Date.now(),
  }
}

// Apply event effects to base stats
export function applyEventEffects(
  baseStats: { happiness: number; hunger: number; health: number },
  tokenId: number
): { happiness: number; hunger: number; health: number } {
  const pending = getPendingEvents(tokenId)
  
  return {
    happiness: clamp(baseStats.happiness + pending.totalHappiness),
    hunger: clamp(baseStats.hunger + pending.totalHunger),
    health: clamp(baseStats.health + pending.totalHealth),
  }
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}