import { createBoard } from './createBoard'
import type { ChallengeDocument } from './types'

export const DEFAULT_BOARD_SIZE = 20
export const DEFAULT_MINE_RATE = 0.2
export const DEFAULT_TIME_LIMIT_SECONDS = 60

export function getBoardSize() {
  const saved = localStorage.getItem('boardSize')

  if (!saved) {
    return DEFAULT_BOARD_SIZE
  }

  const size = Number(saved)

  if (Number.isNaN(size)) {
    return DEFAULT_BOARD_SIZE
  }

  return Math.min(50, Math.max(5, size))
}

export function calculateMineCount(boardSize: number) {
  return Math.round(boardSize * boardSize * DEFAULT_MINE_RATE)
}

export function createInitialChallenge(): ChallengeDocument {
  const boardSize = getBoardSize()
  const mineCount = calculateMineCount(boardSize)

  return {
    number: 1,
    size: boardSize,
    mineCount,
    participants: [],
    selectedPlayer: null,
    status: 'ready',
    remainingSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    cells: createBoard(boardSize),
  }
}

export function createNextChallenge(
  currentChallenge: ChallengeDocument,
): ChallengeDocument {
  const boardSize = currentChallenge.size
  const mineCount = calculateMineCount(boardSize)

  return {
    ...currentChallenge,
    number: currentChallenge.number + 1,
    size: boardSize,
    mineCount,
    participants: [],
    selectedPlayer: null,
    status: 'ready',
    remainingSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    cells: createBoard(boardSize),
  }
}

export function recreateChallengeBoard(
    currentChallenge: ChallengeDocument,
  ): ChallengeDocument {
    const boardSize = getBoardSize()
    const mineCount = calculateMineCount(boardSize)
  
    return {
      ...currentChallenge,
      size: boardSize,
      mineCount,
      participants: [],
      selectedPlayer: null,
      status: 'ready',
      remainingSeconds: DEFAULT_TIME_LIMIT_SECONDS,
      cells: createBoard(boardSize),
    }
  }