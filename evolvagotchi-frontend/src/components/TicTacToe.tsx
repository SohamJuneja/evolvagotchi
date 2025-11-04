import { useState } from 'react'
import { X } from 'lucide-react'

interface TicTacToeProps {
  onGameWin: (gameName: string) => void
  onClose: () => void
}

type Cell = 'X' | 'O' | null
type Board = Cell[]

export function TicTacToe({ onGameWin, onClose }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing')
  const [winningLine, setWinningLine] = useState<number[] | null>(null)

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ]

  const checkWinner = (currentBoard: Board): { winner: 'X' | 'O' | null; line: number[] | null } => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: pattern }
      }
    }
    return { winner: null, line: null }
  }

  const isBoardFull = (currentBoard: Board): boolean => {
    return currentBoard.every(cell => cell !== null)
  }

  const getEmptyCells = (currentBoard: Board): number[] => {
    return currentBoard.map((cell, index) => cell === null ? index : -1).filter(i => i !== -1)
  }

  const makeComputerMove = (currentBoard: Board) => {
    const emptyCells = getEmptyCells(currentBoard)
    if (emptyCells.length === 0) return

    // Simple AI: Random move
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    
    setTimeout(() => {
      const newBoard = [...currentBoard]
      newBoard[randomIndex] = 'O'
      setBoard(newBoard)

      const { winner, line } = checkWinner(newBoard)
      if (winner === 'O') {
        setGameStatus('lost')
        setWinningLine(line)
      } else if (isBoardFull(newBoard)) {
        setGameStatus('draw')
      } else {
        setIsPlayerTurn(true)
      }
    }, 500)
  }

  const handleCellClick = (index: number) => {
    if (!isPlayerTurn || gameStatus !== 'playing' || board[index] !== null) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    const { winner, line } = checkWinner(newBoard)
    if (winner === 'X') {
      setGameStatus('won')
      setWinningLine(line)
      setTimeout(() => {
        onGameWin('Tic-Tac-Toe')
      }, 500)
      return
    }

    if (isBoardFull(newBoard)) {
      setGameStatus('draw')
      return
    }

    setIsPlayerTurn(false)
    makeComputerMove(newBoard)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setGameStatus('playing')
    setWinningLine(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>❌⭕ Tic-Tac-Toe</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          {gameStatus === 'playing' && (isPlayerTurn ? "Your turn (X)" : "Computer's turn (O)...")}
          {gameStatus === 'won' && "🎉 You won!"}
          {gameStatus === 'lost' && "😔 You lost!"}
          {gameStatus === 'draw' && "🤝 It's a draw!"}
        </div>

        <div className="tictactoe-board">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`tictactoe-cell ${winningLine?.includes(index) ? 'winning-cell' : ''}`}
              onClick={() => handleCellClick(index)}
              disabled={gameStatus !== 'playing' || !isPlayerTurn}
            >
              {cell}
            </button>
          ))}
        </div>

        {gameStatus !== 'playing' && (
          <button 
            className="btn btn-primary" 
            onClick={resetGame}
            style={{ marginTop: '20px', width: '100%' }}
          >
            Play Again
          </button>
        )}

        <style>{`
          .tictactoe-board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            max-width: 300px;
            margin: 0 auto;
          }

          .tictactoe-cell {
            aspect-ratio: 1;
            font-size: 48px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
          }

          .tictactoe-cell:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .tictactoe-cell:disabled {
            cursor: not-allowed;
            opacity: 0.8;
          }

          .tictactoe-cell.winning-cell {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            animation: pulse 0.5s infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    </div>
  )
}
