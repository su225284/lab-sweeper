type Props = {
    remainingMineCount: number
    participantCount: number
    remainingSeconds: number
  }
  
  export default function StatusBar({
    remainingMineCount,
    participantCount,
    remainingSeconds,
  }: Props) {
    return (
      <div className="board-status">
        <span>💣 {remainingMineCount}</span>
        <span>👥 {participantCount}人</span>
        <span>⏱ {remainingSeconds}s</span>
      </div>
    )
  }