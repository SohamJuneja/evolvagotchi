import { useReadContract } from 'wagmi'
import contractABI from '../contracts/Evolvagotchi.json'

const CONTRACT_ADDRESS = contractABI.address as `0x${string}`
const EVOLUTION_STAGES = ['🥚 Egg', '🐣 Baby', '🦖 Teen', '🐲 Adult']
const STAGE_COLORS = ['#e0e0e0', '#ffeb3b', '#ff9800', '#f44336']

interface PetListProps {
  address: string
  onSelectPet: (tokenId: number) => void
  selectedPetId: number | null
}

export function PetList({ address, onSelectPet, selectedPetId }: PetListProps) {
  const { data: userPets } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi,
    functionName: 'getUserPets',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const petIds = userPets as bigint[] | undefined

  if (!petIds || petIds.length === 0) {
    return (
      <div className="empty-pets">
        <p>You don't have any pets yet!</p>
        <p>Mint your first Evolvagotchi to get started 🥚</p>
      </div>
    )
  }

  return (
    <div className="pet-list">
      <h2>Your Pets ({petIds.length})</h2>
      <div className="pet-grid">
        {petIds.map((tokenId) => (
          <PetCard
            key={tokenId.toString()}
            tokenId={Number(tokenId)}
            isSelected={selectedPetId === Number(tokenId)}
            onSelect={() => onSelectPet(Number(tokenId))}
          />
        ))}
      </div>
    </div>
  )
}

interface PetCardProps {
  tokenId: number
  isSelected: boolean
  onSelect: () => void
}

function PetCard({ tokenId, isSelected, onSelect }: PetCardProps) {
  const { data: petInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi,
    functionName: 'getPetInfo',
    args: [BigInt(tokenId)],
  })

  const pet = petInfo as any

  if (!pet) {
    return <div className="pet-card-mini loading">Loading...</div>
  }

  const stats = {
    name: pet[0] as string,
    evolutionStage: Number(pet[3]),
    happiness: Number(pet[4]),
    hunger: Number(pet[5]),
    health: Number(pet[6]),
  }

  return (
    <div
      className={`pet-card-mini ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ borderColor: STAGE_COLORS[stats.evolutionStage] }}
    >
      <div className="pet-card-emoji">
        {EVOLUTION_STAGES[stats.evolutionStage].split(' ')[0]}
      </div>
      <div className="pet-card-info">
        <h3>{stats.name}</h3>
        <span className="pet-card-stage" style={{ background: STAGE_COLORS[stats.evolutionStage] }}>
          {EVOLUTION_STAGES[stats.evolutionStage].split(' ')[1]}
        </span>
        <div className="pet-card-stats">
          <span>❤️ {stats.health}</span>
          <span>😊 {stats.happiness}</span>
          <span>🍖 {stats.hunger}</span>
        </div>
      </div>
    </div>
  )
}