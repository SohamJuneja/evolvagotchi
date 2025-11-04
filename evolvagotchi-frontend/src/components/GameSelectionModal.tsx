import { X } from 'lucide-react'

interface GameSelectionModalProps {
  onGameSelect: (game: 'memory' | 'tictactoe' | 'rps') => void
  onClose: () => void
}

export function GameSelectionModal({ onGameSelect, onClose }: GameSelectionModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-selection-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>🎮 Choose a Game</h2>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
          Win the game to increase your pet's happiness!
        </p>
        
        <div className="game-selection-grid">
          <button 
            className="game-selection-card"
            onClick={() => onGameSelect('memory')}
          >
            <div className="game-icon">🧠</div>
            <h3>Memory Game</h3>
            <p>Match pairs of cards</p>
          </button>
          
          <button 
            className="game-selection-card"
            onClick={() => onGameSelect('tictactoe')}
          >
            <div className="game-icon">❌⭕</div>
            <h3>Tic-Tac-Toe</h3>
            <p>Beat the computer</p>
          </button>
          
          <button 
            className="game-selection-card"
            onClick={() => onGameSelect('rps')}
          >
            <div className="game-icon">✊✋✌️</div>
            <h3>Rock Paper Scissors</h3>
            <p>Test your luck</p>
          </button>
        </div>
      </div>
    </div>
  )
}
