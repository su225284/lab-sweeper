import Button from './Button'

type Props = {
  status: 'ready' | 'playing' | 'cleared' | 'failed' | 'timeUp'
  overlayType: 'boom' | null
  onNextChallenge: () => void
}

export default function GameOverlay({
  status,
  overlayType,
  onNextChallenge,
}: Props) {
  if (overlayType === 'boom') {
    return (
      <div className="game-overlay">
        <div className="game-over-panel">
          <p className="game-over">💥 BOOM!</p>
          <p className="overlay-message">新しい盤面で続けます。</p>
        </div>
      </div>
    )
  }

  if (status === 'ready' || status === 'playing' || status === 'failed') {
    return null
  }

  if (status === 'timeUp') {
    return (
      <div className="game-overlay">
        <div className="game-over-panel">
          <p className="time-up-message">⏰ TIME UP</p>
          <p className="overlay-message">今回のプレイはここまでです。</p>
          <p className="overlay-submessage">
            次のプレイヤーの挑戦を待っています…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-overlay">
      <div className="game-over-panel">
        <p className="clear-message">🎉 CLEAR!</p>
        <p className="overlay-message">チャレンジクリア！</p>
        <Button fullWidth variant="primary" onClick={onNextChallenge}>
          Next Challenge
        </Button>
      </div>
    </div>
  )
}