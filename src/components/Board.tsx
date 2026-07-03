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
import Card from './Card'
import {
  saveChallengeHistory,
  saveCurrentChallenge,
  subscribeCurrentChallenge,
  type ChallengeDocument,
} from '../services/challengeService'


const SIZE = 5
const MINE_COUNT = 5
const TIME_LIMIT_SECONDS = 60

type GameStatus = 'ready' | 'playing' | 'cleared' | 'failed' | 'timeUp'

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
  const [localPlayer, setLocalPlayer] = useState<string | null>(null)

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
  
    saveChallengeHistory(
      {
        ...challenge,
        status: 'timeUp',
        remainingSeconds,
        cells,
      },
      'timeUp',
    )
  
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
      const newCells = createBoard(SIZE)
  
      setCells(newCells)
      setBoardReady(false)
      setOverlayType(null)
      setGameStatus('ready')
      setRemainingSeconds(TIME_LIMIT_SECONDS)
  
      setChallenge((current) => ({
        ...current,
        number: current.number + 1,
        participants: [],
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: newCells,
      }))
    }, 1200)
  
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [overlayType])

  const startPlaying = async (playerName: string) => {
    setLocalPlayer(playerName)
  
    const nextChallenge = {
      ...challenge,
      selectedPlayer: playerName,
      status: 'playing' as const,
    }
  
    setChallenge(nextChallenge)
    setIsPlayerDialogOpen(false)
    setGameStatus('playing')
  
    await saveCurrentChallenge({
      ...nextChallenge,
      remainingSeconds,
      cells,
    })
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
  
    if (gameStatus === 'timeUp' || gameStatus === 'cleared' || gameStatus === 'failed') {
      return
    }
  
    if (gameStatus === 'ready') {
      if (!challenge.selectedPlayer) {
        setIsPlayerDialogOpen(true)
      }
      return
    }
  
    if (!canOperate) return
  
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
          saveChallengeHistory(
            {
              ...challenge,
              status: 'failed',
              remainingSeconds,
              cells: nextCells,
            },
            'failed',
          )
        
          setGameStatus('failed')
          setOverlayType('boom')
          return nextCells
        }
    
        if (isCleared(nextCells)) {
          saveChallengeHistory(
            {
              ...challenge,
              status: 'cleared',
              remainingSeconds,
              cells: nextCells,
            },
            'cleared',
          )
    
          setGameStatus('cleared')
        }
    
        return nextCells
      })
    
      return
    }
  
    if (targetCell.hasMine) {
      const explodedCells = cells.map((cell) =>
        cell.id === id ? { ...cell, opened: true } : cell,
      )
    
      saveChallengeHistory(
        {
          ...challenge,
          status: 'failed',
          remainingSeconds,
          cells: explodedCells,
        },
        'failed',
      )
    
      setCells(explodedCells)
      setGameStatus('failed')
      setOverlayType('boom')
      return
    }
  
    addCurrentPlayerToParticipants()
  
    setCells((currentCells) => {
      const nextCells = openCells(currentCells, id, SIZE)
    
      if (isCleared(nextCells)) {
        saveChallengeHistory(
          {
            ...challenge,
            status: 'cleared',
            remainingSeconds,
            cells: nextCells,
          },
          'cleared',
        )
    
        setGameStatus('cleared')
      }
    
      return nextCells
    })
  }

const toggleFlag = (id: number) => {
  if (!canOperate) return

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
    await saveChallengeHistory(
      {
        ...challenge,
        status: 'timeUp',
        remainingSeconds,
        cells,
      },
      'timeUp',
    )
  
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

  const canOperate =
  gameStatus === 'playing' &&
  challenge.selectedPlayer !== null &&
  localPlayer === challenge.selectedPlayer &&
  !overlayType

  const isOtherPlayerPlaying =
  gameStatus === 'playing' &&
  challenge.selectedPlayer !== null &&
  localPlayer !== challenge.selectedPlayer


  return (
    <div className="board-wrapper">
      <GameOverlay
        status={gameStatus}
        overlayType={overlayType}
        onNextChallenge={startNextChallenge}
      />

    <Card className="challenge-card">
      <div className="challenge-title">
        第{challenge.number}回チャレンジ
      </div>

      <div className="current-player">
        {isOtherPlayerPlaying
          ? `🔒 ${challenge.selectedPlayer}さんがプレイ中です`
          : challenge.selectedPlayer && gameStatus === 'playing'
            ? `👤 ${challenge.selectedPlayer}さんがプレイ中`
            : '👤 次のプレイヤーを待っています'}
      </div>
    </Card>

    <StatusBar
        remainingMineCount={MINE_COUNT - cells.filter((cell) => cell.flagged).length}
        participantCount={challenge.participants.length}
        remainingSeconds={remainingSeconds}
        />
    

    <div className="play-action-row">
    <ActionButton
      mode={
        gameStatus === 'ready' && !challenge.selectedPlayer
          ? 'join'
          : canOperate
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
            disabled={
              gameStatus === 'cleared' ||
              gameStatus === 'timeUp' ||
              gameStatus === 'failed' ||
              Boolean(overlayType) ||
              (gameStatus === 'playing' && !canOperate)
            }
            canFlag={canOperate}
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