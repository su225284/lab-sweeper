const MEMBERS = ['山田', '田中', '鈴木', '佐藤']

type Props = {
  open: boolean
  onClose: () => void
  onStart: (playerName: string) => void
}

export default function PlayerDialog({ open, onClose, onStart }: Props) {
  if (!open) return null

  return (
    <div className="dialog-backdrop">
      <div className="player-dialog">
        <h2>プレイヤーを選択</h2>

        <div className="player-list">
          {MEMBERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onStart(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <button type="button" className="secondary-button" onClick={onClose}>
          キャンセル
        </button>
      </div>
    </div>
  )
}