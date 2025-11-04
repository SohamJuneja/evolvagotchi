import { useState } from 'react'
import { X } from 'lucide-react'

interface RockPaperScissorsProps {
  onGameWin: (gameName: string) => void
  onClose: () => void
}

type Choice = 'rock' | 'paper' | 'scissors' | null

const CHOICES = {
  rock: { emoji: '✊', label: 'Rock' },
  paper: { emoji: '✋', label: 'Paper' },
  scissors: { emoji: '✌️', label: 'Scissors' }
}

export function RockPaperScissors({ onGameWin, onClose }: RockPaperScissorsProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null)

  const determineWinner = (player: Choice, computer: Choice): 'win' | 'lose' | 'draw' => {
    if (player === computer) return 'draw'
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win'
    }
    
    return 'lose'
  }

  const handleChoice = (choice: Choice) => {
    if (!choice) return

    const computerOptions: Choice[] = ['rock', 'paper', 'scissors']
    const randomChoice = computerOptions[Math.floor(Math.random() * computerOptions.length)]

    setPlayerChoice(choice)
    setComputerChoice(randomChoice)
    
    const gameResult = determineWinner(choice, randomChoice)
    setResult(gameResult)
  }

  const handleClaimReward = () => {
    onGameWin('Rock Paper Scissors')
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>✊✋✌️ Rock Paper Scissors</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          {!playerChoice && "Choose your move!"}
          {playerChoice && !result && "Calculating..."}
          {result && (
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {result === 'win' && "🎉 You Win!"}
              {result === 'lose' && "😔 You Lose!"}
              {result === 'draw' && "🤝 It's a Draw!"}
            </div>
          )}
        </div>

        {!playerChoice ? (
          <div className="rps-choices">
            {(Object.keys(CHOICES) as Choice[]).filter(c => c !== null).map((choice) => (
              <button
                key={choice}
                className="rps-choice-btn"
                onClick={() => handleChoice(choice)}
              >
                <div className="rps-emoji">{CHOICES[choice!].emoji}</div>
                <div className="rps-label">{CHOICES[choice!].label}</div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="rps-result">
              <div className="rps-result-choice">
                <div className="rps-result-label">You chose:</div>
                <div className="rps-result-emoji">{CHOICES[playerChoice].emoji}</div>
                <div className="rps-result-name">{CHOICES[playerChoice].label}</div>
              </div>
              
              <div className="rps-vs">VS</div>
              
              <div className="rps-result-choice">
                <div className="rps-result-label">Computer chose:</div>
                <div className="rps-result-emoji">{computerChoice && CHOICES[computerChoice].emoji}</div>
                <div className="rps-result-name">{computerChoice && CHOICES[computerChoice].label}</div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              {result === 'win' ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleClaimReward}
                  style={{ width: '100%' }}
                >
                  🎁 Claim Reward
                </button>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={resetGame}
                  style={{ width: '100%' }}
                >
                  Play Again
                </button>
              )}
            </div>
          </>
        )}

        <style>{`
          .rps-choices {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            max-width: 400px;
            margin: 0 auto;
          }

          .rps-choice-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            padding: 24px 16px;
            cursor: pointer;
            transition: all 0.3s;
            color: white;
          }

          .rps-choice-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
          }

          .rps-emoji {
            font-size: 48px;
            margin-bottom: 8px;
          }

          .rps-label {
            font-size: 16px;
            font-weight: 600;
          }

          .rps-result {
            display: flex;
            align-items: center;
            justify-content: space-around;
            gap: 16px;
            margin: 20px 0;
          }

          .rps-result-choice {
            flex: 1;
            text-align: center;
          }

          .rps-result-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }

          .rps-result-emoji {
            font-size: 64px;
            margin: 12px 0;
          }

          .rps-result-name {
            font-size: 18px;
            font-weight: bold;
          }

          .rps-vs {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
        `}</style>
      </div>
    </div>
  )
}
