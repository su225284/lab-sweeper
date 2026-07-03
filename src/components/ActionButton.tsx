type Props = {
    mode: 'join' | 'quit' | 'hidden'
    onJoin: () => void
    onQuit: () => void
  }
  
  export default function ActionButton({ mode, onJoin, onQuit }: Props) {
    if (mode === 'hidden') {
      return <div className="action-button-placeholder" />
    }
  
    if (mode === 'join') {
      return (
        <button type="button" className="action-button action-button-primary" onClick={onJoin}>
          ▶ チャレンジに参加
        </button>
      )
    }
  
    return (
      <button type="button" className="action-button action-button-secondary" onClick={onQuit}>
        やめる
      </button>
    )
  }