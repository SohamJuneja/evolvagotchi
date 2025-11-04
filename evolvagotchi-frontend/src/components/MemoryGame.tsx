import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface MemoryGameProps {
  onGameWin: (gameName: string) => void
  onClose: () => void
}

interface Card {
  id: number
  icon: string
  isFlipped: boolean
  isMatched: boolean
}

const CARD_ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊']

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function MemoryGame({ onGameWin, onClose }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = CARD_ICONS.flatMap((icon, index) => [
      { id: index * 2, icon, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, icon, isFlipped: false, isMatched: false }
    ])
    
    // Shuffle cards
    const shuffled = shuffleArray(cardPairs)
    setCards(shuffled)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setIsChecking(false)
  }

  const handleCardClick = (cardId: number) => {
    if (isChecking) return
    if (flippedCards.includes(cardId)) return
    if (cards[cardId].isMatched) return
    if (flippedCards.length >= 2) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // Update card state to show it's flipped
    setCards(prevCards => 
      prevCards.map((card, index) => 
        index === cardId ? { ...card, isFlipped: true } : card
      )
    )

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)
      setIsChecking(true)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards[firstId]
      const secondCard = cards[secondId]

      if (firstCard.icon === secondCard.icon) {
        // Match found!
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map((card, index) => 
              index === firstId || index === secondId 
                ? { ...card, isMatched: true } 
                : card
            )
          )
          setFlippedCards([])
          setIsChecking(false)
          setMatchedPairs(prev => {
            const newMatched = prev + 1
            // Check if all pairs are matched
            if (newMatched === CARD_ICONS.length) {
              setTimeout(() => {
                onGameWin('Memory Game')
              }, 500)
            }
            return newMatched
          })
        }, 600)
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map((card, index) => 
              index === firstId || index === secondId 
                ? { ...card, isFlipped: false } 
                : card
            )
          )
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>🧠 Memory Game</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Moves: {moves} | Matched: {matchedPairs}/{CARD_ICONS.length}
        </div>

        <div className="memory-grid">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front">?</div>
                <div className="memory-card-back">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {matchedPairs === CARD_ICONS.length && (
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '20px' }}>
            🎉 You won in {moves} moves!
          </div>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={initializeGame}
          style={{ marginTop: '16px', width: '100%' }}
        >
          Reset Game
        </button>

        <style>{`
          .memory-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            max-width: 400px;
            margin: 0 auto;
          }

          .memory-card {
            aspect-ratio: 1;
            cursor: pointer;
            perspective: 1000px;
          }

          .memory-card.matched {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .memory-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }

          .memory-card.flipped .memory-card-inner {
            transform: rotateY(180deg);
          }

          .memory-card-front,
          .memory-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-size: 40px;
            font-weight: bold;
          }

          .memory-card-front {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .memory-card-back {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            transform: rotateY(180deg);
          }

          .game-modal {
            max-width: 500px;
          }
        `}</style>
      </div>
    </div>
  )
}
