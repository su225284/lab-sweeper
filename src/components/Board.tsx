import { useState } from 'react'
import { createBoard } from '../game/createBoard'
import { openAround } from '../game/openAround'
import { openCells } from '../game/openCells'
import type { Cell } from '../game/types'
import CellButton from './CellButton'
import GameOverlay from './GameOverlay'

const SIZE = 5
const MINE_COUNT = 5

type GameStatus = 'playing' | 'gameOver' | 'cleared'

function isCleared(cells: Cell[]) {
  return cells.every((cell) => cell.hasMine || cell.opened)
}

export default function Board() {
  const [cells, setCells] = useState<Cell[]>(() =>
    createBoard(SIZE, MINE_COUNT),
  )
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')

  const openCell = (id: number) => {
    if (gameStatus !== 'playing') return

    const targetCell = cells.find((cell) => cell.id === id)
    if (!targetCell || targetCell.flagged) return

    if (targetCell.opened) {
      setCells((currentCells) => {
        const nextCells = openAround(currentCells, id, SIZE)

        if (nextCells.some((cell) => cell.opened && cell.hasMine)) {
          setGameStatus('gameOver')
          return nextCells.map((cell) =>
            cell.hasMine ? { ...cell, opened: true } : cell,
          )
        }

        if (isCleared(nextCells)) {
          setGameStatus('cleared')
        }

        return nextCells
      })
      return
    }

    if (targetCell.hasMine) {
      setGameStatus('gameOver')
      setCells((currentCells) =>
        currentCells.map((cell) =>
          cell.hasMine ? { ...cell, opened: true } : cell,
        ),
      )
      return
    }

    setCells((currentCells) => {
      const nextCells = openCells(currentCells, id, SIZE)

      if (isCleared(nextCells)) {
        setGameStatus('cleared')
      }

      return nextCells
    })
  }

  const toggleFlag = (id: number) => {
    if (gameStatus !== 'playing') return

    setCells((currentCells) =>
      currentCells.map((cell) => {
        if (cell.id !== id || cell.opened) return cell
        return { ...cell, flagged: !cell.flagged }
      }),
    )
  }

  const restartGame = () => {
    setCells(createBoard(SIZE, MINE_COUNT))
    setGameStatus('playing')
  }

  return (
    <div className="board-wrapper">
      <GameOverlay status={gameStatus} onRestart={restartGame} />
  
      <div className="board-grid">
        {cells.map((cell) => (
          <CellButton
            key={cell.id}
            cell={cell}
            disabled={gameStatus !== 'playing'}
            onOpen={openCell}
            onToggleFlag={toggleFlag}
          />
        ))}
      </div>
    </div>
  )
}