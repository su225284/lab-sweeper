import Button from './Button'

type Props = {
  mode: 'join' | 'quit' | 'hidden'
  onJoin: () => void
  onQuit: () => void
}

export default function ActionButton({
  mode,
  onJoin,
  onQuit,
}: Props) {
  if (mode === 'hidden') {
    return <div className="action-button-placeholder" />
  }

  if (mode === 'join') {
    return (
      <Button
        fullWidth
        variant="primary"
        onClick={onJoin}
      >
        ▶ チャレンジに参加
      </Button>
    )
  }

  return (
    <Button
      fullWidth
      variant="secondary"
      onClick={onQuit}
    >
      やめる
    </Button>
  )
}