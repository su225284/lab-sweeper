import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { calculateNumbers } from '../game/calculateNumbers'
import {
  createInitialChallenge,
  createNextChallenge,
  recreateChallengeBoard,
  DEFAULT_TIME_LIMIT_SECONDS,
} from '../game/challengeFactory'
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

const TIME_LIMIT_SECONDS = DEFAULT_TIME_LIMIT_SECONDS

type GameStatus = 'ready' | 'playing' | 'cleared' | 'failed' | 'timeUp'

type OverlayType = 'boom' | null

function isCleared(cells: Cell[]) {
  return cells.every((cell) => cell.hasMine || cell.opened)
}

type BoardProps = {
  settingsVersion: number
  showToast: (message: string) => void
  onBoardSizeChange?: (size: number) => void
}

export default function Board({
  settingsVersion,
  showToast,
  onBoardSizeChange,
}: BoardProps) {
  const [cells, setCells] = useState<Cell[]>(() =>
    createInitialChallenge().cells
  )
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready')
  const [remainingSeconds, setRemainingSeconds] = useState(TIME_LIMIT_SECONDS)
  const [boardReady, setBoardReady] = useState(false)
  const [overlayType, setOverlayType] = useState<OverlayType>(null)
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false)
  const [challenge, setChallenge] = useState<ChallengeDocument>(() =>
    createInitialChallenge()
  )
  const [localPlayer, setLocalPlayer] = useState<string | null>(null)
  const boardWrapperRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(520)

  const SIZE = challenge.size
  const MINE_COUNT = challenge.mineCount

  useEffect(() => {
    onBoardSizeChange?.(challenge.size)
  }, [challenge.size, onBoardSizeChange])


  useEffect(() => {
    const element = boardWrapperRef.current
    if (!element) return
  
    const resizeObserver = new ResizeObserver(() => {
      setBoardWidth(element.clientWidth)
    })
  
    resizeObserver.observe(element)
  
    setBoardWidth(element.clientWidth)
  
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeCurrentChallenge(async (savedChallenge) => {
      if (!savedChallenge.cells || !Array.isArray(savedChallenge.cells)) {
        const resetChallenge = createInitialChallenge()
      
        await saveCurrentChallenge(resetChallenge)
      
        setChallenge(resetChallenge)
        setCells(resetChallenge.cells)
        setRemainingSeconds(resetChallenge.remainingSeconds)
        setGameStatus(resetChallenge.status)
        setBoardReady(false)
      
        return
      }
  
      setChallenge(savedChallenge)
      setCells(savedChallenge.cells)
      setRemainingSeconds(savedChallenge.remainingSeconds)
      setGameStatus(savedChallenge.status)
      setBoardReady(savedChallenge.cells.some((cell) => cell.opened))

      if (savedChallenge.status === 'playing') {
        setIsPlayerDialogOpen(false)
      }
    })
  
    return unsubscribe
  }, [])

  useEffect(() => {
    if (settingsVersion === 0) return
  
    // プレイ中や終了演出中は現在のChallengeを変更しない
    if (challenge.status !== 'ready') {
      showToast('盤面サイズは次のChallengeから反映されます。')
      return
    }
  
    // 誰かが参加済みなら現在のChallengeは変更しない
    if (
      challenge.selectedPlayer !== null ||
      challenge.participants.length > 0
    ) {
      showToast('盤面サイズは次のChallengeから反映されます。')
      return
    }
  
    const nextChallenge = recreateChallengeBoard(challenge)

    setChallenge(nextChallenge)
    setCells(nextChallenge.cells)
    setBoardReady(false)
    setGameStatus('ready')
    setRemainingSeconds(nextChallenge.remainingSeconds)
    
    saveCurrentChallenge(nextChallenge)
  
    showToast(
      `盤面サイズを ${nextChallenge.size}×${nextChallenge.size} に変更しました。`,
    )
  }, [settingsVersion])


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
  
    let cancelled = false
    let timeoutId: number | null = null
  
    const handleTimeUp = async () => {
      await saveChallengeHistory(
        {
          ...challenge,
          status: 'timeUp',
          remainingSeconds: 0,
          cells,
        },
        'timeUp',
      )
  
      if (cancelled) return
  
      await saveCurrentState('timeUp')
  
      if (cancelled) return
  
      timeoutId = window.setTimeout(() => {
        returnToReady()
      }, 3000)
    }
  
    handleTimeUp()
  
    return () => {
      cancelled = true
  
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [gameStatus])

  useEffect(() => {
    if (overlayType !== 'boom') return
  
    const timeoutId = window.setTimeout(async () => {
      const nextChallenge = createNextChallenge(challenge)
    
      setCells(nextChallenge.cells)
      setBoardReady(false)
      setOverlayType(null)
      setGameStatus('ready')
      setRemainingSeconds(nextChallenge.remainingSeconds)
      setChallenge(nextChallenge)
    
      await saveCurrentChallenge(nextChallenge)
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

  const addCurrentPlayerToParticipants = async (nextCells: Cell[]) => {
    const playerName = challenge.selectedPlayer
  
    if (!playerName) {
      return challenge
    }
  
    const nextChallenge: ChallengeDocument = {
      ...challenge,
      participants: challenge.participants.includes(playerName)
        ? challenge.participants
        : [...challenge.participants, playerName],
      remainingSeconds,
      cells: nextCells,
    }
  
    setChallenge(nextChallenge)
    await saveCurrentChallenge(nextChallenge)
  
    return nextChallenge
  }

  

  const openCell = async (id: number) => {
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
    
    if (challenge.selectedPlayer !== null && localPlayer !== challenge.selectedPlayer) {
      return
    }
  
    if (!canOperate) return
  
    const targetCell = cells.find((cell) => cell.id === id)
    if (!targetCell || targetCell.flagged) return
 
  
    if (!boardReady) {
      console.log('Board size:', SIZE)
      console.log('Mine count:', MINE_COUNT)
      const boardWithMines = placeMines(cells, SIZE, MINE_COUNT, id)
      const boardWithNumbers = calculateNumbers(boardWithMines, SIZE)
      const openedBoard = openCells(boardWithNumbers, id, SIZE)
      const nextChallenge = await addCurrentPlayerToParticipants(openedBoard)
    
      setCells(openedBoard)
      setBoardReady(true)
    
      if (isCleared(openedBoard)) {
        await saveChallengeHistory(
          {
            ...nextChallenge,
            status: 'cleared',
            remainingSeconds,
            cells: openedBoard,
          },
          'cleared',
        )
    
        setGameStatus('cleared')
      }
    
      return
    }
  
    if (targetCell.opened) {
      setCells((currentCells) => {
        const result = openAround(currentCells, id, SIZE)
        const nextCells = result.cells
    
        const nextChallenge = {
          ...challenge,
          remainingSeconds,
          cells: nextCells,
        }
    
        setChallenge(nextChallenge)
        saveCurrentChallenge(nextChallenge)
    
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
  
    setCells((currentCells) => {
      const nextCells = openCells(currentCells, id, SIZE)
    
      const nextChallenge = {
        ...challenge,
        remainingSeconds,
        cells: nextCells,
      }
    
      saveCurrentChallenge(nextChallenge)
      setChallenge(nextChallenge)
    
      if (isCleared(nextCells)) {
        saveChallengeHistory(
          {
            ...nextChallenge,
            status: 'cleared',
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
  
    setCells((currentCells) => {
      const nextCells = currentCells.map((cell) => {
        if (cell.id !== id || cell.opened) return cell
        return { ...cell, flagged: !cell.flagged }
      })
  
      const nextChallenge = {
        ...challenge,
        remainingSeconds,
        cells: nextCells,
      }
  
      setChallenge(nextChallenge)
      saveCurrentChallenge(nextChallenge)
  
      return nextCells
    })
  }

  const startNextChallenge = async () => {
    const nextChallenge = createNextChallenge(challenge)
  
    setCells(nextChallenge.cells)
    setBoardReady(false)
    setGameStatus('ready')
    setRemainingSeconds(nextChallenge.remainingSeconds)
    setOverlayType(null)
    setChallenge(nextChallenge)
  
    await saveCurrentChallenge(nextChallenge)
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

  const cellSize = boardWidth / SIZE
  const numberSize = Math.max(10, cellSize * 0.72)
  const iconSize = numberSize * 0.9
  const bevelSize = Math.max(1, Math.min(6, cellSize * 0.08))
  
  const boardStyle = {
    '--grid-size': SIZE,
    '--number-size': `${numberSize}px`,
    '--icon-size': `${iconSize}px`,
    '--bevel-size': `${bevelSize}px`,
  } as CSSProperties


  return (
    <div className="board-wrapper" ref={boardWrapperRef}>
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
      remainingMineCount={
        challenge.mineCount - cells.filter((cell) => cell.flagged).length
      }
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

    <div className="board-grid" style={boardStyle}>
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