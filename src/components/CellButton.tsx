import { useRef } from 'react'
import type { MouseEvent } from 'react'
import type { Cell } from '../game/types'

type Props = {
  cell: Cell
  disabled: boolean
  canFlag: boolean
  onOpen: (id: number) => void
  onToggleFlag: (id: number) => void
}

export default function CellButton({
  cell,
  disabled,
  canFlag,
  onOpen,
  onToggleFlag,
}: Props) {
  const longPressTimerRef = useRef<number | null>(null)
  const longPressedRef = useRef(false)

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  
    if (!canFlag) return
  
    onToggleFlag(cell.id)
  }

  const handlePointerDown = () => {
    if (!canFlag) return
  
    longPressedRef.current = false
  
    longPressTimerRef.current = window.setTimeout(() => {
      longPressedRef.current = true
      onToggleFlag(cell.id)
    }, 500)
  }

  const handlePointerUp = () => {
    clearLongPressTimer()
  }

  const handleClick = () => {
    if (longPressedRef.current) {
      longPressedRef.current = false
      return
    }

    onOpen(cell.id)
  }

  return (
    <button
      className={`cell ${cell.opened ? 'cell-opened' : ''} ${
        cell.opened && cell.hasMine ? 'cell-mine' : ''
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={clearLongPressTimer}
      onPointerCancel={clearLongPressTimer}
      disabled={disabled}
    >
      {!cell.opened && cell.flagged && '🚩'}
      {cell.opened && cell.hasMine && '💣'}
      {cell.opened && !cell.hasMine && cell.count > 0 && cell.count}
    </button>
  )
}