import Button from './Button'

type Props = {
  status: 'ready' | 'playing' | 'cleared' | 'failed' | 'timeUp'
  overlayType: 'boom' | 'timeUp' | 'quit' | null
  explosionCount: number
  onNextChallenge: () => void
  isSavingEnd: boolean
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

  if (overlayType === 'timeUp') {
    return (
      <div className="game-overlay">
        <div className="game-over-panel">
          <p className="time-up-message">⏰ TIME UP</p>

          <p className="overlay-message">
            今回のプレイはここまでです。
          </p>

          <div className="saving-message">
            <span
              className="saving-spinner"
              aria-hidden="true"
            />

            <p className="saving-text">
              保存中…
            </p>

            <p className="saving-note">
              画面を更新しないでください
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (overlayType === 'quit') {
    return (
      <div className="game-overlay">
        <div className="game-over-panel">
          <p className="time-up-message">👋 プレイ終了</p>
  
          <p className="overlay-message">
            今回のプレイはここまでです。
          </p>
  
          <div className="saving-message">
            <span
              className="saving-spinner"
              aria-hidden="true"
            />
  
            <p className="saving-text">
              保存中…
            </p>
  
            <p className="saving-note">
              画面を更新しないでください
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status !== 'cleared') {
    return null
  }

  return (
    <div className="game-overlay">
      <div className="game-over-panel">
        <p className="clear-message">🎉 CLEAR!</p>

        <p className="overlay-message">
          チャレンジクリア！
        </p>

        <Button
          fullWidth
          variant="primary"
          onClick={onNextChallenge}
        >
          次のチャレンジへ
        </Button>
      </div>
    </div>
  )
}