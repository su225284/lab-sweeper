type Props = {
    status: 'playing' | 'gameOver' | 'cleared'
    onRestart: () => void
  }
  
  export default function GameOverlay({ status, onRestart }: Props) {
    if (status === 'playing') return null
  
    if (status === 'gameOver') {
      return (
        <div className="game-over-panel">
          <p className="game-over">GAME OVER</p>
          <button onClick={onRestart}>Restart</button>
        </div>
      )
    }
  
    return (
      <div className="game-over-panel">
        <p className="clear-message">CLEAR!</p>
        <button onClick={onRestart}>Next Challenge</button>
      </div>
    )
  }