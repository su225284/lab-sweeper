import Button from './Button'

type Props = {
  status: 'ready' | 'playing' | 'cleared' | 'failed' | 'timeUp'
  overlayType: 'boom' | null
  explosionCount: number
  onNextChallenge: () => void
}

export default function GameOverlay({
  status,
  overlayType,
  explosionCount,
  onNextChallenge,
}: Props) {
  if (overlayType === 'boom') {
    return (
      <div className="game-overlay">
        <div className="game-over-panel">
          <p className="game-over">💥 BOOM!</p>
  
          <p className="overlay-message">
            今回のプレイ内容を元に戻しました
          </p>
  
          <p className="overlay-count">
            爆発回数：計{explosionCount}回
          </p>
  
          <p className="overlay-submessage">
            チャレンジは続きます
          </p>
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
          次のチャレンジへ
        </Button>
      </div>
    </div>
  )
}