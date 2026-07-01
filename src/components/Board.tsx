import { useState } from 'react'
import { createBoard } from '../game/createBoard'
import type { Cell } from '../game/types'
import { openCells } from '../game/openCells'

const SIZE = 5
const MINE_COUNT = 5

export default function Board() {
  const [cells, setCells] = useState<Cell[]>(() =>
    createBoard(SIZE, MINE_COUNT),
  )
  const [gameOver, setGameOver] = useState(false)

  const openCell = (id: number) => {
    if (gameOver) return
  
    const targetCell = cells.find((cell) => cell.id === id)
    if (!targetCell || targetCell.opened) return
  
    if (targetCell.hasMine) {
      setGameOver(true)
      setCells((currentCells) =>
        currentCells.map((cell) =>
          cell.hasMine ? { ...cell, opened: true } : cell,
        ),
      )
      return
    }
  
    // ←ここだけ変更！
    setCells((currentCells) => openCells(currentCells, id, SIZE))
  }

  const restartGame = () => {
    setCells(createBoard(SIZE, MINE_COUNT))
    setGameOver(false)
  }

  return (
    <>
      {gameOver && (
        <div>
          <p className="game-over">GAME OVER</p>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}

      <div className="board-grid">
        {cells.map((cell) => (
          <button
            key={cell.id}
            className={`cell ${cell.opened ? 'cell-opened' : ''} ${
              cell.opened && cell.hasMine ? 'cell-mine' : ''
            }`}
            onClick={() => openCell(cell.id)}
            disabled={gameOver}
          >
            {cell.opened && cell.hasMine && '💣'}
            {cell.opened && !cell.hasMine && cell.count > 0 && cell.count}
          </button>
        ))}
      </div>
    </>
  )
}