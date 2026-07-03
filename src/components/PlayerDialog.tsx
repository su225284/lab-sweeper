import Button from './Button'
import { getMembers } from '../game/memberManager'


type Props = {
  open: boolean
  onClose: () => void
  onStart: (playerName: string) => void
}

export default function PlayerDialog({ open, onClose, onStart }: Props) {
  const members = getMembers()

  if (!open) return null

  return (
    <div className="dialog-backdrop">
      <div className="player-dialog">
        <h2>プレイヤーを選択</h2>

        <div className="player-list">
          {members.map((name) => (
            <Button
              fullWidth
              variant="secondary"
              onClick={() => onStart(name)}
            >
              {name}
            </Button>
          ))}
        </div>

        <Button
          fullWidth
          variant="ghost"
          onClick={onClose}
        >
          キャンセル
        </Button>
      </div>
    </div>
  )
}