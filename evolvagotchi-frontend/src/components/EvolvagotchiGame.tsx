import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useWriteContract, useSwitchChain, useChainId, useReadContract } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { parseEther } from 'viem'
import { Wallet, AlertTriangle, ArrowLeft, BookOpen } from 'lucide-react'
import { PetList } from './PetList'
import { PetDetail } from './PetDetail'
import { getEventCount } from '../services/eventStorage'
import { DemoControls } from './DemoControls'
import { EvolutionInfo } from './EvolutionInfo'
import contractABI from '../contracts/Evolvagotchi.json'

const CONTRACT_ADDRESS = contractABI.address as `0x${string}`
const MINT_COST = '0.01'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function EvolvagotchiGame() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContract, isPending } = useWriteContract()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [petName, setPetName] = useState('')
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null)
  const [showMintForm, setShowMintForm] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [demoEnabled, setDemoEnabled] = useState(false)
  const [demoOverrides, setDemoOverrides] = useState<{
    age?: number
    evolutionStage?: number
    happiness?: number
    hunger?: number
    health?: number
  }>({})
  const [showEventHistory, setShowEventHistory] = useState(false)
  const [pendingEventCount, setPendingEventCount] = useState(0)

  useEffect(() => {
    if (selectedPetId !== null) {
      setPendingEventCount(getEventCount(selectedPetId))
    }
  }, [selectedPetId, showEventHistory])

  const CORRECT_CHAIN_ID = 50312
  const isCorrectNetwork = chainId === CORRECT_CHAIN_ID

  // Get pet info for demo calculations
  const { data: petInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi,
    functionName: 'getPetInfo',
    args: selectedPetId !== null ? [BigInt(selectedPetId)] : undefined,
    query: {
      enabled: selectedPetId !== null,
    },
  })

  const handleConnect = async () => {
    try {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xC478',
              chainName: 'Somnia Devnet',
              nativeCurrency: {
                name: 'STT',
                symbol: 'STT',
                decimals: 18,
              },
              rpcUrls: ['https://dream-rpc.somnia.network/'],
              blockExplorerUrls: ['https://somniascan.io'],
            }],
          })
        } catch (addError: any) {
          console.log('Network add error:', addError)
        }
      }
      connect({ connector: injected() })
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const handleMint = async () => {
    if (!petName.trim()) {
      alert('Please enter a pet name!')
      return
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI.abi,
        functionName: 'mint',
        args: [petName],
        value: parseEther(MINT_COST),
      })
      setPetName('')
      setShowMintForm(false)
    } catch (error) {
      console.error('Mint error:', error)
    }
  }

  // Demo mode helper functions
  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.floor(v)))

  const checkEvolution = (stage: number, age: number, happiness: number, health: number): number => {
    const EGG_TO_BABY = 25000
    const BABY_TO_TEEN = 100000
    const TEEN_TO_ADULT = 300000
    const HAPPINESS_THRESHOLD = 60

    if (stage === 0 && age >= EGG_TO_BABY) return 1
    if (stage === 1 && age >= BABY_TO_TEEN && happiness >= HAPPINESS_THRESHOLD) return 2
    if (stage === 2 && age >= TEEN_TO_ADULT && happiness >= HAPPINESS_THRESHOLD && health >= 80) return 3
    return stage
  }

  const handleAdvanceTime = (blocksToAdd: number) => {
    if (!petInfo || !demoEnabled) return

    const pet = petInfo as any
    const baseAge = Number(pet[2])
    const baseHappiness = Number(pet[4])
    const baseHunger = Number(pet[5])
    const baseHealth = Number(pet[6])
    const baseStage = Number(pet[3])

    // Apply existing overrides or use base values
    const currentAge = demoOverrides.age ?? baseAge
    const currentHappiness = demoOverrides.happiness ?? baseHappiness
    const currentHunger = demoOverrides.hunger ?? baseHunger
    const currentHealth = demoOverrides.health ?? baseHealth
    const currentStage = demoOverrides.evolutionStage ?? baseStage

    // Calculate new stats based on time advancement
    const newAge = currentAge + blocksToAdd
    
    const BLOCKS_PER_HUNGER = 500
    const BLOCKS_PER_HAPPINESS = 1000
    const hungerIncrease = Math.floor(blocksToAdd / BLOCKS_PER_HUNGER)
    const happinessDecrease = Math.floor(blocksToAdd / BLOCKS_PER_HAPPINESS)

    let newHunger = clamp(currentHunger + hungerIncrease)
    let newHappiness = clamp(currentHappiness - happinessDecrease)
    let newHealth = currentHealth

    // Health logic
    if (newHunger > 80 && newHealth > 0) {
      const healthDecrease = Math.floor((newHunger - 80) / 5)
      newHealth = Math.max(1, newHealth - healthDecrease)
    }
    if (newHunger < 30 && newHappiness > 70 && newHealth < 100) {
      newHealth = clamp(newHealth + 1)
    }

    // Check for evolution
    const newStage = checkEvolution(currentStage, newAge, newHappiness, newHealth)

    setDemoOverrides({
      age: newAge,
      hunger: newHunger,
      happiness: newHappiness,
      health: newHealth,
      evolutionStage: newStage,
    })
  }

  const handleForceEvolve = () => {
    if (!petInfo || !demoEnabled) return

    const pet = petInfo as any
    const currentStage = demoOverrides.evolutionStage ?? Number(pet[3])
    const nextStage = Math.min(3, currentStage + 1)

    setDemoOverrides({
      ...demoOverrides,
      evolutionStage: nextStage,
    })
  }

  const handleAdjustStats = (happiness: number, hunger: number, health: number) => {
    if (!petInfo || !demoEnabled) return

    const pet = petInfo as any
    const currentAge = demoOverrides.age ?? Number(pet[2])
    const currentStage = demoOverrides.evolutionStage ?? Number(pet[3])

    // Check if new stats trigger evolution
    const newStage = checkEvolution(currentStage, currentAge, happiness, health)

    setDemoOverrides({
      ...demoOverrides,
      happiness: clamp(happiness),
      hunger: clamp(hunger),
      health: clamp(health),
      evolutionStage: newStage,
    })
  }

  const handleResetDemo = () => {
    setDemoOverrides({})
  }

  const handleToggleDemo = () => {
    if (demoEnabled) {
      setDemoOverrides({})
    }
    setDemoEnabled(!demoEnabled)
  }

  if (!isConnected) {
    return (
      <div className="container">
        <div className="hero">
          <h1 className="title">🐾 Evolvagotchi</h1>
          <p className="subtitle">Your Autonomous On-Chain Pet</p>
          <p className="description">
            Powered by Somnia AI Agents • Evolves automatically • Lives forever on-chain
          </p>
          <button className="btn btn-primary" onClick={handleConnect}>
            <Wallet size={20} />
            Connect Wallet
          </button>
          <button className="btn btn-secondary" onClick={() => setShowInfo(true)}>
            <BookOpen size={20} />
            How It Works
          </button>
        </div>

        {showInfo && (
          <div className="modal-overlay" onClick={() => setShowInfo(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
              <EvolutionInfo />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">🐾 Evolvagotchi</h1>
        <div className="header-actions">
          {selectedPetId !== null && (
            <button 
              className="btn btn-small btn-info event-history-fab" 
              style={{ marginRight: 8 }}
              onClick={() => setShowEventHistory((v) => !v)}
            >
              📜 Events{pendingEventCount > 0 ? ` (${pendingEventCount})` : ''}
            </button>
          )}
          <button className="btn btn-small btn-info" onClick={() => setShowInfo(true)}>
            <BookOpen size={16} />
            Guide
          </button>
          <span className="address">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <button className="btn btn-small" onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      </header>

      {!isCorrectNetwork && (
        <div className="network-warning">
          <AlertTriangle size={24} />
          <div>
            <strong>Wrong Network!</strong>
            <p>Please switch to Somnia Devnet (Chain ID: 50312)</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => switchChain({ chainId: CORRECT_CHAIN_ID })}
          >
            Switch Network
          </button>
        </div>
      )}

      <div className="main-content">
        <div className="left-panel">
          {selectedPetId !== null && (
            <button className="btn btn-back" onClick={() => { setSelectedPetId(null); setDemoOverrides({}); }}>
              <ArrowLeft size={16} />
              Back to Pet List
            </button>
          )}

          {selectedPetId === null ? (
            <>
              <PetList
                address={address || ''}
                onSelectPet={(id) => { setSelectedPetId(id); setDemoOverrides({}); }}
                selectedPetId={selectedPetId}
              />
              <button 
                className="btn btn-primary btn-mint" 
                onClick={() => setShowMintForm(!showMintForm)}
              >
                {showMintForm ? 'Cancel' : '+ Mint New Pet'}
              </button>

              {showMintForm && (
                <div className="mint-form">
                  <input
                    type="text"
                    placeholder="Enter pet name (max 20 chars)"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value.slice(0, 20))}
                    className="input"
                    maxLength={20}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleMint}
                    disabled={isPending || !petName.trim() || !isCorrectNetwork}
                  >
                    {isPending ? '⏳ Minting...' : `✨ Mint (${MINT_COST} STT)`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <PetDetail 
              tokenId={selectedPetId} 
              isCorrectNetwork={isCorrectNetwork}
              demoOverrides={demoEnabled ? demoOverrides : undefined}
              demoControls={
                <DemoControls
                  enabled={demoEnabled}
                  onToggle={handleToggleDemo}
                  onAdvanceTime={handleAdvanceTime}
                  onForceEvolve={handleForceEvolve}
                  onAdjustStats={handleAdjustStats}
                  onReset={handleResetDemo}
                />
              }
              showEventHistory={showEventHistory}
              setShowEventHistory={setShowEventHistory}

            />
          )}
        </div>
      </div>

      {/* Floating Event History Button removed, now in header */}

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
            <EvolutionInfo />
          </div>
        </div>
      )}
    </div>
  )
}