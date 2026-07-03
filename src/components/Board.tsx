import { useEffect, useState } from 'react'
import { calculateNumbers } from '../game/calculateNumbers'
import { createBoard } from '../game/createBoard'
import { openAround } from '../game/openAround'
import { openCells } from '../game/openCells'
import { placeMines } from '../game/placeMines'
import type { Cell } from '../game/types'
import CellButton from './CellButton'
import GameOverlay from './GameOverlay'
import PlayerDialog from './PlayerDialog'
import StatusBar from './StatusBar'
import ActionButton from './ActionButton'
import {
  saveCurrentChallenge,
  subscribeCurrentChallenge,
  type ChallengeDocument,
} from '../services/challengeService'


const SIZE = 5
const MINE_COUNT = 5
const TIME_LIMIT_SECONDS = 60

type GameStatus = 'ready' | 'playing' | 'cleared' | 'timeUp'

type OverlayType = 'boom' | null

function isCleared(cells: Cell[]) {
  return cells.every((cell) => cell.hasMine || cell.opened)
}

export default function Board() {
  const [cells, setCells] = useState<Cell[]>(() => createBoard(SIZE))
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [remainingSeconds, setRemainingSeconds] = useState(TIME_LIMIT_SECONDS)
  const [boardReady, setBoardReady] = useState(false)
  const [overlayType, setOverlayType] = useState<OverlayType>(null)
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false)
  const [challenge, setChallenge] = useState<ChallengeDocument>({
    number: 1,
    size: SIZE,
    mineCount: MINE_COUNT,
    participants: [],
    selectedPlayer: null,
    status: 'ready',
    remainingSeconds: TIME_LIMIT_SECONDS,
    cells: createBoard(SIZE),
  })

  useEffect(() => {
    const unsubscribe = subscribeCurrentChallenge((savedChallenge) => {
      setChallenge(savedChallenge)
      setCells(savedChallenge.cells)
      setRemainingSeconds(savedChallenge.remainingSeconds)
      setGameStatus(savedChallenge.status)
      setBoardReady(savedChallenge.cells.some((cell) => cell.opened))
    })
  
    return unsubscribe
  }, [])

  useEffect(() => {
    if (gameStatus !== 'playing' || overlayType) return

    const timerId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timerId)
          setGameStatus('timeUp')
          return 0
        }

        return currentSeconds - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [gameStatus])

  useEffect(() => {
    if (gameStatus !== 'timeUp') return
  
    saveCurrentState('timeUp')
  
    const timeoutId = window.setTimeout(() => {
      returnToReady()
    }, 3000)
  
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [gameStatus])

  useEffect(() => {
    if (overlayType !== 'boom') return
  
    const timeoutId = window.setTimeout(() => {
      setCells(createBoard(SIZE))
      setBoardReady(false)
      setOverlayType(null)
  
      setChallenge((current) => ({
        ...current,
        number: current.number + 1,
        participants: [],
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: createBoard(SIZE),
      }))
    }, 1200)
  
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [overlayType])

  const startPlaying = (playerName: string) => {
    setChallenge((current) => ({
      ...current,
      selectedPlayer: playerName,
      status: 'playing',
    }))
  
    setIsPlayerDialogOpen(false)
    setGameStatus('playing')
  }

  const addCurrentPlayerToParticipants = () => {
    const playerName = challenge.selectedPlayer
    if (!playerName) return
  
    setChallenge((current) => ({
      ...current,
      participants: current.participants.includes(playerName)
        ? current.participants
        : [...current.participants, playerName],
    }))
  }

  const openCell = (id: number) => {
    if (overlayType) return
  
    if (gameStatus === 'timeUp' || gameStatus === 'cleared') return
  
    if (gameStatus === 'ready') {
      setIsPlayerDialogOpen(true)
      return
    }
  
    if (gameStatus !== 'playing') return
  
    const targetCell = cells.find((cell) => cell.id === id)
    if (!targetCell || targetCell.flagged) return
  
    if (!boardReady) {
      addCurrentPlayerToParticipants()
  
      const boardWithMines = placeMines(cells, SIZE, MINE_COUNT, id)
      const boardWithNumbers = calculateNumbers(boardWithMines, SIZE)
      const openedBoard = openCells(boardWithNumbers, id, SIZE)
  
      setCells(openedBoard)
      setBoardReady(true)
  
      if (isCleared(openedBoard)) {
        setGameStatus('cleared')
      }
  
      return
    }
  
    if (targetCell.opened) {
      setCells((currentCells) => {
        const result = openAround(currentCells, id, SIZE)
        const nextCells = result.cells
  
        if (result.exploded) {
          setOverlayType('boom')
          return nextCells
        }
  
        if (isCleared(nextCells)) {
          setGameStatus('cleared')
        }
  
        return nextCells
      })
  
      return
    }
  
    if (targetCell.hasMine) {
      setCells((currentCells) =>
        currentCells.map((cell) =>
          cell.id === id ? { ...cell, opened: true } : cell,
        ),
      )
      setOverlayType('boom')
      return
    }
  
    addCurrentPlayerToParticipants()
  
    setCells((currentCells) => {
      const nextCells = openCells(currentCells, id, SIZE)
  
      if (isCleared(nextCells)) {
        setGameStatus('cleared')
      }
  
      return nextCells
    })
  }

  const toggleFlag = (id: number) => {
    if (gameStatus === 'cleared' || gameStatus === 'timeUp' || overlayType) {
      return
    }

    setCells((currentCells) =>
      currentCells.map((cell) => {
        if (cell.id !== id || cell.opened) return cell
        return { ...cell, flagged: !cell.flagged }
      }),
    )
  }

  const startNextChallenge = () => {
    setCells(createBoard(SIZE))
    setBoardReady(false)
    setGameStatus('ready')
    setRemainingSeconds(TIME_LIMIT_SECONDS)
    setOverlayType(null)
    setChallenge((current) => ({
        ...current,
        number: current.number + 1,
        participants: [],
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: createBoard(SIZE),
      }))
  }

  const returnToReady = async () => {
    const nextChallenge = {
      ...challenge,
      selectedPlayer: null,
      status: 'ready' as const,
      remainingSeconds: TIME_LIMIT_SECONDS,
      cells,
    }
  
    setGameStatus('ready')
    setRemainingSeconds(TIME_LIMIT_SECONDS)
    setOverlayType(null)
    setChallenge(nextChallenge)
    setBoardReady(cells.some((cell) => cell.opened))
  
    await saveCurrentChallenge(nextChallenge)
  }

  const quitPlaying = async () => {
    await saveCurrentState('timeUp')
    setGameStatus('timeUp')
  }

  const saveCurrentState = async (status = gameStatus) => {
    await saveCurrentChallenge({
      ...challenge,
      status,
      remainingSeconds,
      cells,
    })
  }


  return (
    <div className="board-wrapper">
      <GameOverlay
        status={gameStatus}
        overlayType={overlayType}
        onNextChallenge={startNextChallenge}
      />

    <div className="challenge-card">
        <div className="challenge-title">
            第{challenge.number}回チャレンジ
        </div>

        <div className="current-player">
        {challenge.selectedPlayer && gameStatus === 'playing'
        ? `👤 ${challenge.selectedPlayer}さんがプレイ中`
        : '👤 次のプレイヤーを待っています'}
        </div>
    </div>

    <StatusBar
        remainingMineCount={MINE_COUNT - cells.filter((cell) => cell.flagged).length}
        participantCount={challenge.participants.length}
        remainingSeconds={remainingSeconds}
        />
    

    <div className="play-action-row">
    <ActionButton
        mode={
        gameStatus === 'ready'
            ? 'join'
            : gameStatus === 'playing'
            ? 'quit'
            : 'hidden'
        }
        onJoin={() => setIsPlayerDialogOpen(true)}
        onQuit={quitPlaying}
    />
    </div>

    <div className="board-grid">
        {cells.map((cell) => (
            <CellButton
                key={cell.id}
                cell={cell}
                disabled={gameStatus === 'cleared' || gameStatus === 'timeUp' || Boolean(overlayType)}
                canFlag={gameStatus === 'playing' && !overlayType}
                onOpen={openCell}
                onToggleFlag={toggleFlag}
                />
        ))}
      </div>
      <PlayerDialog
        open={isPlayerDialogOpen}
        onClose={() => setIsPlayerDialogOpen(false)}
        onStart={startPlaying}
        />
    </div>
  )
}