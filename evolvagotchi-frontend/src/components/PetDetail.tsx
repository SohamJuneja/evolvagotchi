import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Heart, Drumstick, Sparkles, RefreshCw, Zap, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PetChat } from './PetChat'
import { EventNotification } from './EventNotification'
import  EventHistory  from './EventHistory'
import { NFTArtGenerator } from './NFTArtGenerator'
import { PetTimeline } from './PetTimeline'
import { HealthAdvisor } from './HealthAdvisor'
import { AchievementGallery } from './AchievementGallery'
import { getPetResponse } from '../services/groqService'
import { triggerRandomEvent, shouldTriggerEvent, getEventChance } from '../services/eventService'
import type { GameEvent } from '../services/eventService'
import { addPendingEvent, applyEventEffects, clearPendingEvents, getPendingEvents, hasPendingEvents } from '../services/eventStorage'
import { logEvolution, logFeed, logPlay, logRandomEvent } from '../services/petHistory'
import { useAchievements } from '../services/useAchievements'
import contractABI from '../contracts/Evolvagotchi.json'

const CONTRACT_ADDRESS = contractABI.address as `0x${string}`
const FEED_COST = '0.001'
const REVIVAL_COST = '0.005'
const EVOLUTION_STAGES = ['🥚 Egg', '🐣 Baby', '🦖 Teen', '🐲 Adult']
const STAGE_COLORS = ['#e0e0e0', '#ffeb3b', '#ff9800', '#f44336']
// const DEATH_STAGE = '👻 Ghost' // For future use

interface PetDetailProps {
  tokenId: number
  isCorrectNetwork: boolean
  demoOverrides?: {
    age?: number
    evolutionStage?: number
    happiness?: number
    hunger?: number
    health?: number
  }
  demoControls?: React.ReactNode
  showEventHistory: boolean
  setShowEventHistory: (show: boolean) => void
}

export function PetDetail({ tokenId, isCorrectNetwork, demoOverrides, demoControls, showEventHistory, setShowEventHistory }: PetDetailProps) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const achievements = useAchievements()
  const [txStatus, setTxStatus] = useState('')
  const [petReaction, setPetReaction] = useState('')
  const [showReaction, setShowReaction] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [lastEventTime, setLastEventTime] = useState<number | null>(null)
  const [interactionCount, setInteractionCount] = useState(0)
  const [isGeneratingEvent, setIsGeneratingEvent] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showPendingBanner, setShowPendingBanner] = useState(true)
  const [previousStage, setPreviousStage] = useState<number | null>(null)
  const [showEvolutionEffect, setShowEvolutionEffect] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const { data: petInfo, refetch: refetchPetInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi,
    functionName: 'getPetInfo',
    args: [BigInt(tokenId)],
  })

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirming) {
      setTxStatus('⏳ Transaction pending...')
    } else if (isConfirmed) {
      const wasSyncing = isSyncing
      const hasPending = hasPendingEvents(tokenId)
      
      // Clear pending events after successful transaction
      if (hasPending || wasSyncing) {
        clearPendingEvents(tokenId)
        setTxStatus('✅ Events synced to blockchain!')
      } else {
        setTxStatus('✅ Transaction confirmed!')
      }
      
      // Always clear syncing state on confirmation
      setIsSyncing(false)
      
      refetchPetInfo()
      setTimeout(() => setTxStatus(''), 3000)
      
      // Increment interaction count
      setInteractionCount(prev => prev + 1)
      
      // Check for random event (but not when syncing)
      if (!wasSyncing) {
        checkForRandomEvent()
      }
    }
  }, [isConfirming, isConfirmed, refetchPetInfo, tokenId])

  const checkForRandomEvent = async () => {
    if (!pet || isGeneratingEvent) return
    
    // Check if enough time has passed
    if (!shouldTriggerEvent(lastEventTime)) return
    
    // Random chance based on interactions
    const chance = getEventChance(interactionCount)
    if (Math.random() > chance) return
    
    setIsGeneratingEvent(true)
    
    const event = await triggerRandomEvent({
      name: stats.name,
      evolutionStage: stats.evolutionStage,
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
      age: stats.age,
    })
    
    // Add event to storage immediately when generated
    addPendingEvent(tokenId, event)
    
    setCurrentEvent(event)
    setLastEventTime(Date.now())
    setIsGeneratingEvent(false)
  }

  const handleCloseEvent = () => {
    // Just close the notification, event already stored
    setCurrentEvent(null)
  }

  const handleSyncEvents = async () => {
    setIsSyncing(true)
    try {
      const pending = getPendingEvents(tokenId)
      
      // If we have event effects, apply them via contract
      if (pending.events.length > 0) {
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractABI.abi,
          functionName: 'applyEventEffects',
          args: [
            BigInt(tokenId),
            Math.floor(pending.totalHappiness),
            Math.floor(pending.totalHunger),
            Math.floor(pending.totalHealth),
          ],
        })
      } else {
        // No events, just regular update
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractABI.abi,
          functionName: 'updateState',
          args: [BigInt(tokenId)],
        })
      }
      
      // Wait for confirmation, then clear (handled by useEffect)
    } catch (error) {
      console.error('Sync error:', error)
      setIsSyncing(false)
    }
  }

  const handleTriggerEvent = async () => {
    if (!pet || isGeneratingEvent) return
    
    setIsGeneratingEvent(true)
    
    const event = await triggerRandomEvent({
      name: stats.name,
      evolutionStage: stats.evolutionStage,
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
      age: stats.age,
    })
    
    // Add event to storage immediately when generated
    addPendingEvent(tokenId, event)
    
    // Log to history
    logRandomEvent(tokenId, stats.name, event.title, event.description, {
      happiness: stats.happiness,
      hunger: stats.hunger,
      health: stats.health,
    })
    
    setCurrentEvent(event)
    setLastEventTime(Date.now())
    setIsGeneratingEvent(false)
  }

  const handleFeed = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI.abi,
        functionName: 'feed',
        args: [BigInt(tokenId)],
        value: parseEther(FEED_COST),
      })
      
      // Record achievement
      achievements.recordFeed(BigInt(tokenId))
      
      // Log to history
      logFeed(tokenId, stats.name, {
        happiness: stats.happiness,
        hunger: stats.hunger,
        health: stats.health,
      })
      
      // Get AI reaction
      if (pet) {
        const reaction = await getPetResponse({
          name: stats.name,
          evolutionStage: stats.evolutionStage,
          happiness: stats.happiness,
          hunger: stats.hunger,
          health: stats.health,
          age: stats.age,
          interaction: 'feed',
        })
        setPetReaction(reaction)
        setShowReaction(true)
        setTimeout(() => setShowReaction(false), 5000)
      }
    } catch (error) {
      console.error('Feed error:', error)
    }
  }

  const handlePlay = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI.abi,
        functionName: 'play',
        args: [BigInt(tokenId)],
      })
      
      // Record achievement
      achievements.recordPlay(BigInt(tokenId))
      
      // Log to history
      logPlay(tokenId, stats.name, {
        happiness: stats.happiness,
        hunger: stats.hunger,
        health: stats.health,
      })
      
      // Get AI reaction
      if (pet) {
        const reaction = await getPetResponse({
          name: stats.name,
          evolutionStage: stats.evolutionStage,
          happiness: stats.happiness,
          hunger: stats.hunger,
          health: stats.health,
          age: stats.age,
          interaction: 'play',
        })
        setPetReaction(reaction)
        setShowReaction(true)
        setTimeout(() => setShowReaction(false), 5000)
      }
    } catch (error) {
      console.error('Play error:', error)
    }
  }

  const handleUpdateState = async () => {
    try {
      // If there are pending events, sync them first
      if (hasPending) {
        setIsSyncing(true)
        await handleSyncEvents()
      } else {
        // Regular update
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: contractABI.abi,
          functionName: 'updateState',
          args: [BigInt(tokenId)],
        })
      }
    } catch (error) {
      console.error('Update error:', error)
      setIsSyncing(false)
    }
  }

  const handleRevive = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI.abi,
        functionName: 'revive',
        args: [BigInt(tokenId)],
        value: parseEther(REVIVAL_COST),
      })
      
      // Record achievement
      achievements.recordRevival(BigInt(tokenId))
    } catch (error) {
      console.error('Revive error:', error)
    }
  }

  const pet = petInfo as any

  if (!pet) {
    return <div className="loading">Loading pet details...</div>
  }

  const baseStats = {
    name: pet[0] as string,
    birthDate: pet[1],
    age: Number(pet[2]),
    evolutionStage: Number(pet[3]),
    happiness: Number(pet[4]),
    hunger: Number(pet[5]),
    health: Number(pet[6]),
    blocksSinceUpdate: Number(pet[7]),
    isDead: Boolean(pet[8]),
    deathTimestamp: Number(pet[9]),
  }

  // Apply event effects to stats (only if not in demo mode)
  const statsWithEvents = demoOverrides ? baseStats : {
    ...baseStats,
    ...applyEventEffects(
      { happiness: baseStats.happiness, hunger: baseStats.hunger, health: baseStats.health },
      tokenId
    ),
  }

  // Apply demo overrides if provided
  const stats = {
    ...statsWithEvents,
    age: demoOverrides?.age ?? statsWithEvents.age,
    evolutionStage: demoOverrides?.evolutionStage ?? statsWithEvents.evolutionStage,
    happiness: demoOverrides?.happiness ?? statsWithEvents.happiness,
    hunger: demoOverrides?.hunger ?? statsWithEvents.hunger,
    health: demoOverrides?.health ?? statsWithEvents.health,
  }

  const isDemoActive = !!demoOverrides && Object.keys(demoOverrides).length > 0
  const hasPending = hasPendingEvents(tokenId)

  // First pet achievement (check once on mount)
  useEffect(() => {
    // Award "First Steps" achievement for owning this pet
    achievements.recordFirstPet(BigInt(tokenId))
  }, []) // Only run once on mount

  // Evolution detection effect
  useEffect(() => {
    if (previousStage !== null && stats.evolutionStage > previousStage) {
      // Evolution detected!
      setShowEvolutionEffect(true)
      setTimeout(() => setShowEvolutionEffect(false), 3000) // Hide after 3 seconds
      
      // Log evolution to history
      logEvolution(tokenId, stats.name, previousStage, stats.evolutionStage, EVOLUTION_STAGES[stats.evolutionStage])
      
      // Record evolution achievement
      achievements.recordEvolution(BigInt(tokenId), BigInt(stats.evolutionStage))
    }
    
    setPreviousStage(stats.evolutionStage)
  }, [stats.evolutionStage, previousStage])

  // Perfect stats detection
  useEffect(() => {
    if (stats.happiness === 100 && stats.hunger === 0 && stats.health === 100) {
      achievements.recordPerfectStats(BigInt(tokenId))
    }
  }, [stats.happiness, stats.hunger, stats.health])

  // Death detection - Log when pet dies
  useEffect(() => {
    if (stats.isDead && stats.deathTimestamp > 0) {
      // Log death to history if it's new
      const deathTime = stats.deathTimestamp * 1000 // Convert to ms
      const now = Date.now()
      
      // Only log if death happened recently (within last hour) to avoid logging old deaths
      if (now - deathTime < 3600000) {
        logRandomEvent(tokenId, stats.name, '💀 Death', `${stats.name} has died`, {
          happiness: stats.happiness,
          hunger: stats.hunger,
          health: 0,
        })
      }
    }
  }, [stats.isDead, stats.deathTimestamp])

  // Auto-hide pending banner after 10 seconds
  useEffect(() => {
    if (hasPending && showPendingBanner) {
      const timer = setTimeout(() => {
        setShowPendingBanner(false)
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [hasPending, showPendingBanner])

  // Reset banner visibility when hasPending changes
  useEffect(() => {
    if (hasPending) {
      setShowPendingBanner(true)
    }
  }, [hasPending])

  // Calculate time in human-readable format (assuming ~6 blocks/sec)
  const ageInSeconds = Math.floor(stats.age / 6)
  const ageInMinutes = Math.floor(ageInSeconds / 60)
  const ageInHours = Math.floor(ageInMinutes / 60)
  const displayAge = ageInHours > 0 
    ? `${ageInHours}h ${ageInMinutes % 60}m` 
    : `${ageInMinutes}m ${ageInSeconds % 60}s`

  return (
    <div className="pet-detail">
      {isDemoActive && (
        <div className="demo-badge">
          🎮 Demo Mode Active - Stats are simulated
        </div>
      )}

      {hasPending && !isDemoActive && showPendingBanner && (
        <div className="sync-banner">
          <span>📊 You have pending events! Stats shown include event effects.</span>
          <div className="sync-banner-actions">
            <button className="btn btn-small" onClick={() => setShowEventHistory(!showEventHistory)}>
              {showEventHistory ? 'Hide' : 'View'} Events
            </button>
            <button className="btn btn-small btn-close" onClick={() => setShowPendingBanner(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      {txStatus && (
        <div className="notification">
          {txStatus}
        </div>
      )}

      {showReaction && petReaction && (
        <div className="pet-reaction">
          <div className="reaction-bubble">
            {petReaction}
          </div>
        </div>
      )}

      {currentEvent && (
        <EventNotification event={currentEvent} onClose={handleCloseEvent} />
      )}

      {showEvolutionEffect && (
        <div className="evolution-effect">
          <div className="evolution-content">
            <Sparkles size={64} className="evolution-icon" />
            <h2>Evolution!</h2>
            <p>{stats.name} evolved to {EVOLUTION_STAGES[stats.evolutionStage]}!</p>
          </div>
        </div>
      )}

      {showEventHistory && (
        <div className="event-history-modal">
          <EventHistory 
            tokenId={tokenId} 
            onSync={handleSyncEvents}
            isSyncing={isSyncing}
          />
        </div>
      )}

      {showTimeline && (
        <PetTimeline
          tokenId={tokenId}
          petName={stats.name}
          onClose={() => setShowTimeline(false)}
        />
      )}

      <div className="pet-and-chat-grid">
        {/* Pet Card Section */}
        <div className="pet-display">
          <div className="pet-card" style={{ borderColor: STAGE_COLORS[stats.evolutionStage] }}>
            <div className="pet-header">
              <h2 className="pet-name">{stats.name}</h2>
              <span className="pet-stage" style={{ background: STAGE_COLORS[stats.evolutionStage] }}>
                {EVOLUTION_STAGES[stats.evolutionStage]}
              </span>
            </div>

            <div className="pet-visual" data-stage={stats.isDead ? 'dead' : stats.evolutionStage}>
              <div className="stage-background"></div>
              <div className="stage-particles">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="particle"></div>
                ))}
              </div>
              <div className="pet-emoji">
                {stats.isDead ? '👻' : EVOLUTION_STAGES[stats.evolutionStage].split(' ')[0]}
              </div>
              {stats.isDead && (
                <div className="death-overlay">
                  <div className="death-content">
                    <h3>💀 Your Pet Has Died</h3>
                    <p>Your {stats.name} has passed away...</p>
                    <p className="revival-prompt">Pay {REVIVAL_COST} STT to bring them back to life!</p>
                    <button
                      className="btn btn-revive"
                      onClick={handleRevive}
                      disabled={isPending || !isCorrectNetwork}
                    >
                      💚 Revive for {REVIVAL_COST} STT
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pet-stats">
              <div className="stat">
                <div className="stat-header">
                  <Heart size={16} color="#e91e63" />
                  <span>Health</span>
                  <span className="stat-value">{stats.health}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill health" style={{ width: `${stats.health}%` }} />
                </div>
              </div>

              <div className="stat">
                <div className="stat-header">
                  <Sparkles size={16} color="#ffc107" />
                  <span>Happiness</span>
                  <span className="stat-value">{stats.happiness}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill happiness" style={{ width: `${stats.happiness}%` }} />
                </div>
              </div>

              <div className="stat">
                <div className="stat-header">
                  <Drumstick size={16} color="#ff5722" />
                  <span>Hunger</span>
                  <span className="stat-value">{stats.hunger}</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill hunger" style={{ width: `${stats.hunger}%` }} />
                </div>
              </div>
            </div>

            <div className="pet-info-grid">
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{displayAge}</span>
                <span className="info-subtext">{stats.age.toLocaleString()} blocks</span>
              </div>
              <div className="info-item">
                <span className="info-label">Token ID</span>
                <span className="info-value">#{tokenId}</span>
              </div>
            </div>

            {/* Achievement Badges */}
            <AchievementGallery petTokenId={BigInt(tokenId)} compact={true} />
          </div>

          <div className="actions">
            {stats.isDead ? (
              <button
                className="btn btn-action btn-revive"
                onClick={handleRevive}
                disabled={isPending || !isCorrectNetwork}
                style={{ width: '100%', background: '#4caf50' }}
              >
                💚 Revive Pet ({REVIVAL_COST} STT)
              </button>
            ) : (
              <>
                <button
                  className="btn btn-action btn-feed"
                  onClick={handleFeed}
                  disabled={isPending || !isCorrectNetwork}
                >
                  <Drumstick size={20} />
                  Feed ({FEED_COST} STT)
                </button>

                <button
                  className="btn btn-action btn-play"
                  onClick={handlePlay}
                  disabled={isPending || !isCorrectNetwork}
                >
                  <Sparkles size={20} />
                  Play (Free)
                </button>

                <button
                  className="btn btn-action btn-update"
                  onClick={handleUpdateState}
                  disabled={isPending || !isCorrectNetwork || isSyncing}
                >
                  <RefreshCw size={20} />
                  {hasPending ? 'Sync & Update' : 'Update Stats'}
                </button>

                <button
                  className="btn btn-action btn-event"
                  onClick={handleTriggerEvent}
                  disabled={isGeneratingEvent}
                >
                  <Zap size={20} />
                  {isGeneratingEvent ? 'Generating...' : 'Trigger Event'}
                </button>

                <button
                  className="btn btn-action btn-timeline"
                  onClick={() => setShowTimeline(true)}
                >
                  <BookOpen size={20} />
                  View Timeline
                </button>
              </>
            )}
          </div>

          {/* NFT Art Generator - Below action buttons */}
          <NFTArtGenerator
            tokenId={tokenId}
            petName={stats.name}
            evolutionStage={stats.evolutionStage}
            happiness={stats.happiness}
            hunger={stats.hunger}
            health={stats.health}
          />
        </div>

        {/* Right Side - AI Chat & Health Advisor */}
        <div className="chat-container">
          {/* AI Chat Section */}
          <PetChat
            petName={stats.name}
            evolutionStage={stats.evolutionStage}
            happiness={stats.happiness}
            hunger={stats.hunger}
            health={stats.health}
            age={stats.age}
          />
          
          {/* Health Advisor - Proactive guidance system */}
          <HealthAdvisor 
            stats={{
              health: stats.health,
              happiness: stats.happiness,
              hunger: stats.hunger,
              age: stats.age,
              evolutionStage: stats.evolutionStage,
              isDead: stats.isDead,
            }}
            onAction={(action) => {
              // Handle quick actions from advisor
              if (action.includes('Feed')) {
                handleFeed()
              } else if (action.includes('Play')) {
                handlePlay()
              } else if (action.includes('Update') || action.includes('evolve')) {
                handleUpdateState()
              } else if (action.includes('Revive')) {
                handleRevive()
              }
            }}
          />
        </div>
      </div>

      {/* Demo Controls - Above AI Agent Features */}
      {demoControls}

      <div className="info-section">
        <h3>🤖 AI Agent Features</h3>
        <ul className="feature-list">
          <li>✅ Stats decay automatically every ~78 seconds (hunger) and ~2.6 minutes (happiness)</li>
          <li>✅ Pet evolves automatically when conditions are met</li>
          <li>✅ Health decreases if hunger gets too high</li>
          <li>✅ AI Health Advisor provides proactive guidance</li>
          <li>✅ Death/Revival system with ghost state</li>
          <li>✅ Optimized for Somnia's high-speed blockchain!</li>
        </ul>
      </div>
    </div>
  )
}