import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { calculateNumbers } from '../game/calculateNumbers'
import {
  createInitialChallenge,
  createNextChallenge,
  recreateChallengeBoard,
  DEFAULT_TIME_LIMIT_SECONDS,
  DEFAULT_BOARD_SIZE,
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
  updateCurrentChallenge,
  type ChallengeDocument,
} from '../services/challengeService'
import { subscribeBoardSize } from '../services/settingsService'

function cloneCells(cells: Cell[]) {
  return cells.map((cell) => ({
    ...cell,
  }))
}

function createClosedSnapshot(cells: Cell[]) {
  return cells.map((cell) => ({
    ...cell,
    opened: false,
    flagged: false,
  }))
}

const TIME_LIMIT_SECONDS = DEFAULT_TIME_LIMIT_SECONDS

type GameStatus = 'ready' | 'playing' | 'cleared' | 'failed' | 'timeUp'

type OverlayType = 'boom' | 'timeUp' | 'quit' | null

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

  const [configuredBoardSize, setConfiguredBoardSize] =
    useState(DEFAULT_BOARD_SIZE)


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

  const activeTimerSessionRef = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeBoardSize(setConfiguredBoardSize)
  
    return () => unsubscribe()
  }, [])

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
  
        activeTimerSessionRef.current = null
  
        setChallenge(resetChallenge)
        setCells(resetChallenge.cells)
        setRemainingSeconds(resetChallenge.remainingSeconds)
        setGameStatus(resetChallenge.status)
        setBoardReady(false)
  
        return
      }
  
      const timerSessionKey =
        savedChallenge.status === 'playing'
          ? `${savedChallenge.number}-${savedChallenge.selectedPlayer ?? ''}`
          : null
  
      const isExistingPlayingSession =
        timerSessionKey !== null &&
        activeTimerSessionRef.current === timerSessionKey
  
      if (!isExistingPlayingSession) {
        setRemainingSeconds(savedChallenge.remainingSeconds)
      }
  
      activeTimerSessionRef.current = timerSessionKey
  
      setChallenge(savedChallenge)
      setCells(savedChallenge.cells)
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
  
    const nextChallenge = recreateChallengeBoard(
      challenge,
      configuredBoardSize,
    )

    setChallenge(nextChallenge)
    setCells(nextChallenge.cells)
    setBoardReady(false)
    setGameStatus('ready')
    setRemainingSeconds(nextChallenge.remainingSeconds)
    
    void saveCurrentChallenge(nextChallenge)
  
    showToast(
      `盤面サイズを ${nextChallenge.size}×${nextChallenge.size} に変更しました。`,
    )
  }, [settingsVersion])


  useEffect(() => {
    if (gameStatus !== 'playing' || overlayType) return
  
    const timerId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) =>
        Math.max(currentSeconds - 1, 0),
      )
    }, 1000)
  
    return () => {
      window.clearInterval(timerId)
    }
  }, [gameStatus, overlayType])

  useEffect(() => {
    if (gameStatus !== 'playing') return
    if (remainingSeconds > 0) return
  
    const playerName = challenge.selectedPlayer
  
    const nextParticipants =
      playerName && !challenge.participants.includes(playerName)
        ? [...challenge.participants, playerName]
        : challenge.participants
  
    const nextChallenge: ChallengeDocument = {
      ...challenge,
      participants: nextParticipants,
      selectedPlayer: null,
      status: 'timeUp',
      remainingSeconds: 0,
    }
  
    setChallenge(nextChallenge)
    setGameStatus('timeUp')
    setOverlayType('timeUp')
  
    void updateCurrentChallenge({
      participants: nextParticipants,
      selectedPlayer: null,
      status: 'timeUp',
      remainingSeconds: 0,
    })
  }, [
    remainingSeconds,
    gameStatus,
    challenge,
  ])

  

  useEffect(() => {
    if (gameStatus !== 'timeUp') return
  
    const timeoutId = window.setTimeout(() => {
      const confirmedCells = cloneCells(cells)
  
      setChallenge((currentChallenge) => ({
        ...currentChallenge,
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: confirmedCells,
        confirmedCells,
      }))
  
      setCells(confirmedCells)
      setGameStatus('ready')
      setRemainingSeconds(TIME_LIMIT_SECONDS)
      setBoardReady(confirmedCells.some((cell) => cell.opened))
      setOverlayType(null)
  
      void updateCurrentChallenge({
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: confirmedCells,
        confirmedCells,
      })
    }, 2000)
  
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [gameStatus])

  useEffect(() => {
    if (overlayType !== 'boom') return
  
    const timeoutId = window.setTimeout(() => {
      setOverlayType(null)
    }, 2000)
  
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
  
    await updateCurrentChallenge({
      selectedPlayer: playerName,
      status: 'playing',
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

    await updateCurrentChallenge({
      participants: nextChallenge.participants,
      cells: nextCells,
    })

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
    
      const boardWithMines = placeMines(
        cells,
        SIZE,
        MINE_COUNT,
        id,
      )
    
      const boardWithNumbers = calculateNumbers(
        boardWithMines,
        SIZE,
      )
    
      const openedBoard = openCells(
        boardWithNumbers,
        id,
        SIZE,
      )
    
      // 地雷と数字は維持し、すべて閉じた状態を復元地点にする
      const confirmedCells = boardWithNumbers.map((cell) => ({
        ...cell,
        opened: false,
        flagged: false,
      }))
    
      const playerName = challenge.selectedPlayer
    
      const nextParticipants =
        playerName && !challenge.participants.includes(playerName)
          ? [...challenge.participants, playerName]
          : challenge.participants
    
      const nextChallenge: ChallengeDocument = {
        ...challenge,
        participants: nextParticipants,
        remainingSeconds,
        cells: openedBoard,
        confirmedCells,
      }
    
      setChallenge(nextChallenge)
      setCells(openedBoard)
      setBoardReady(true)
    
      await updateCurrentChallenge({
        participants: nextParticipants,
        cells: openedBoard,
        confirmedCells,
      })
    
      if (isCleared(openedBoard)) {
        const clearedChallenge: ChallengeDocument = {
          ...nextChallenge,
          status: 'cleared',
        }
    
        setChallenge(clearedChallenge)
        setGameStatus('cleared')
    
        await updateCurrentChallenge({
          status: 'cleared',
          participants: clearedChallenge.participants,
          remainingSeconds: clearedChallenge.remainingSeconds,
          cells: clearedChallenge.cells,
          confirmedCells: clearedChallenge.confirmedCells,
        })
        
        await saveChallengeHistory(
          clearedChallenge,
          'cleared',
        )
      }
    
      return
    }
  
    if (targetCell.opened) {
      setCells((currentCells) => {
        const result = openAround(currentCells, id, SIZE)
        const nextCells = result.cells

        const playerName = challenge.selectedPlayer

        const nextParticipants =
          playerName && !challenge.participants.includes(playerName)
            ? [...challenge.participants, playerName]
            : challenge.participants
    
        const nextChallenge = {
          ...challenge,
          participants: nextParticipants,
          remainingSeconds,
          cells: nextCells,
        }
    
        setChallenge(nextChallenge)

        void updateCurrentChallenge({
          participants: nextParticipants,
          cells: nextCells,
        })

        if (result.exploded) {
          const restoredCells = cloneCells(challenge.confirmedCells)

          const nextChallenge: ChallengeDocument = {
            ...challenge,
            participants: nextParticipants,
            selectedPlayer: null,
            status: 'ready',
            remainingSeconds: TIME_LIMIT_SECONDS,
            cells: restoredCells,
            explosionCount: challenge.explosionCount + 1,
          }

          setChallenge(nextChallenge)
          setCells(restoredCells)
          setGameStatus('ready')
          setRemainingSeconds(TIME_LIMIT_SECONDS)
          setBoardReady(true)
          setOverlayType('boom')

          void updateCurrentChallenge({
            participants: nextParticipants,
            selectedPlayer: null,
            status: 'ready',
            remainingSeconds: TIME_LIMIT_SECONDS,
            cells: restoredCells,
            explosionCount: challenge.explosionCount + 1,
          })

          return restoredCells
        }

        if (isCleared(nextCells)) {
          const clearedChallenge = {
            ...challenge,
            participants: nextParticipants,
            status: 'cleared' as const,
            remainingSeconds,
            cells: nextCells,
          }

          setChallenge(clearedChallenge)
          setGameStatus('cleared')

          const historyChallenge = {
            ...clearedChallenge,
            participantCount: nextParticipants.length,
            openedSafeCount: nextCells.filter(
              (cell) => !cell.hasMine && cell.opened
            ).length,
            safeCellCount: nextCells.filter(
              (cell) => !cell.hasMine
            ).length,
            progressRate: 100,
          }

          void updateCurrentChallenge({
            participants: nextParticipants,
            status: 'cleared',
            remainingSeconds,
            cells: nextCells,
          })

          void saveChallengeHistory(historyChallenge, 'cleared')
        }
    
        return nextCells
      })
    
      return
    }
  
    if (targetCell.hasMine) {
      const playerName = challenge.selectedPlayer
    
      const nextParticipants =
        playerName && !challenge.participants.includes(playerName)
          ? [...challenge.participants, playerName]
          : challenge.participants
    
      const restoredCells = cloneCells(challenge.confirmedCells)
    
      const nextChallenge: ChallengeDocument = {
        ...challenge,
        participants: nextParticipants,
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: restoredCells,
        explosionCount: challenge.explosionCount + 1,
      }
    
      setChallenge(nextChallenge)
      setCells(restoredCells)
      setGameStatus('ready')
      setRemainingSeconds(TIME_LIMIT_SECONDS)
      setBoardReady(true)
      setOverlayType('boom')
    
      await updateCurrentChallenge({
        participants: nextParticipants,
        selectedPlayer: null,
        status: 'ready',
        remainingSeconds: TIME_LIMIT_SECONDS,
        cells: restoredCells,
        explosionCount: challenge.explosionCount + 1,
      })
    
      return
    }
  
    setCells((currentCells) => {
      const nextCells = openCells(currentCells, id, SIZE)
    
      const playerName = challenge.selectedPlayer
    
      const nextParticipants =
        playerName && !challenge.participants.includes(playerName)
          ? [...challenge.participants, playerName]
          : challenge.participants
    
    
      const nextChallenge: ChallengeDocument = {
        ...challenge,
        participants: nextParticipants,
        remainingSeconds,
        cells: nextCells,
      }
    
      void updateCurrentChallenge({
        participants: nextParticipants,
        cells: nextCells,
      })

      setChallenge(nextChallenge)
    
      if (isCleared(nextCells)) {
        const clearedChallenge = {
          ...nextChallenge,
          status: 'cleared' as const,
        }
      
        const historyChallenge = {
          ...clearedChallenge,
          participantCount: nextChallenge.participants.length,
          openedSafeCount: nextCells.filter(
            (cell) => !cell.hasMine && cell.opened
          ).length,
          safeCellCount: nextCells.filter(
            (cell) => !cell.hasMine
          ).length,
          progressRate: 100,
        }
      
        setChallenge(clearedChallenge)
        setGameStatus('cleared')
      
        void updateCurrentChallenge({
          participants: nextChallenge.participants,
          status: 'cleared',
          remainingSeconds: nextChallenge.remainingSeconds,
          cells: nextChallenge.cells,
          confirmedCells: nextChallenge.confirmedCells,
        })
      
        void saveChallengeHistory(historyChallenge, 'cleared')
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
      
      void updateCurrentChallenge({
        cells: nextCells,
      })
  
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
    const confirmedCells = cloneCells(cells)
  
    const playerName = challenge.selectedPlayer
  
    const nextParticipants =
      playerName && !challenge.participants.includes(playerName)
        ? [...challenge.participants, playerName]
        : challenge.participants
  
    const nextChallenge: ChallengeDocument = {
      ...challenge,
      participants: nextParticipants,
      selectedPlayer: null,
      status: 'ready',
      remainingSeconds: TIME_LIMIT_SECONDS,
      cells: confirmedCells,
      confirmedCells,
    }
  
    setGameStatus('ready')
    setRemainingSeconds(TIME_LIMIT_SECONDS)
    setOverlayType('quit')
    setChallenge(nextChallenge)
    setCells(confirmedCells)
    setBoardReady(confirmedCells.some((cell) => cell.opened))
  
    await updateCurrentChallenge({
      participants: nextParticipants,
      selectedPlayer: null,
      status: 'ready',
      remainingSeconds: TIME_LIMIT_SECONDS,
      cells: confirmedCells,
      confirmedCells,
    })
  
    window.setTimeout(() => {
      setOverlayType(null)
    }, 2000)
  }

  const canOperate =
  gameStatus === 'playing' &&
  challenge.selectedPlayer !== null &&
  localPlayer === challenge.selectedPlayer &&
  !overlayType

  const currentParticipantCount = new Set([
    ...challenge.participants,
    ...(challenge.selectedPlayer ? [challenge.selectedPlayer] : []),
  ]).size
  
  console.log('current participants', {
    participants: challenge.participants,
    selectedPlayer: challenge.selectedPlayer,
    currentParticipantCount,
  })

  const isOtherPlayerPlaying =
  gameStatus === 'playing' &&
  challenge.selectedPlayer !== null &&
  localPlayer !== challenge.selectedPlayer

  const cellSize = boardWidth / SIZE
  const numberSize = Math.max(
    8,
    Math.min(cellSize * 0.62, cellSize - 4),
  )
  const iconSize = Math.max(
    8,
    Math.min(cellSize * 0.58, cellSize - 4),
  )
  const bevelSize = Math.max(
    1,
    Math.min(5, cellSize * 0.07),
  )
  
  const boardStyle = {
    '--grid-size': SIZE,
    '--number-size': `${numberSize}px`,
    '--icon-size': `${iconSize}px`,
    '--bevel-size': `${bevelSize}px`,
  } as CSSProperties


  return (
    <div className="board-wrapper" ref={boardWrapperRef}>
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
        participantCount={currentParticipantCount}
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
          onQuit={returnToReady}
        />
      </div>
  
      <div className="board-area">
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
  
        <GameOverlay
          status={gameStatus}
          overlayType={overlayType}
          explosionCount={challenge.explosionCount}
          onNextChallenge={startNextChallenge}
        />
      </div>
  
      <PlayerDialog
        open={isPlayerDialogOpen}
        onClose={() => setIsPlayerDialogOpen(false)}
        onStart={startPlaying}
      />
    </div>
  )
}