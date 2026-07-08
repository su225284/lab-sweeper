import { useEffect, useState } from 'react'
import Button from './Button'
import { subscribeMembers } from '../game/memberManager'


type Props = {
  open: boolean
  onClose: () => void
  onStart: (playerName: string) => void
}

export default function PlayerDialog({ open, onClose, onStart }: Props) {
  const [members, setMembers] = useState<string[]>([])

  useEffect(() => {
    if (!open) return

    const unsubscribe = subscribeMembers(setMembers)

    return () => unsubscribe()
  }, [open])

  if (!open) return null

  return (
    <div className="dialog-backdrop">
      <div className="player-dialog">
        <h2>プレイヤーを選択</h2>

        <p className="player-dialog-note">
          初めてプレイする方は、
          <br />
          「設定」→「メンバー管理」で名前を追加してください。
        </p>

        <div className="player-list">
          {members.map((member) => (
            <Button
              key={member}
              fullWidth
              variant="secondary"
              onClick={() => onStart(member)}
            >
              {member}
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