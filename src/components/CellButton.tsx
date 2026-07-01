import type { MouseEvent } from 'react'
import type { Cell } from '../game/types'

type Props = {
  cell: Cell
  disabled: boolean
  onOpen: (id: number) => void
  onToggleFlag: (id: number) => void
}

export default function CellButton({
  cell,
  disabled,
  onOpen,
  onToggleFlag,
}: Props) {
  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onToggleFlag(cell.id)
  }

  return (
    <button
      className={`cell ${cell.opened ? 'cell-opened' : ''} ${
        cell.opened && cell.hasMine ? 'cell-mine' : ''
      }`}
      onClick={() => onOpen(cell.id)}
      onContextMenu={handleContextMenu}
      disabled={disabled}
    >
      {!cell.opened && cell.flagged && '🚩'}
      {cell.opened && cell.hasMine && '💣'}
      {cell.opened && !cell.hasMine && cell.count > 0 && cell.count}
    </button>
  )
}