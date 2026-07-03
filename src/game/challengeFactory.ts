import { createBoard } from './createBoard'
import type { ChallengeDocument } from './types'

export const DEFAULT_SIZE = 5
export const DEFAULT_MINE_COUNT = 5
export const DEFAULT_TIME_LIMIT_SECONDS = 60

export function createInitialChallenge(): ChallengeDocument {
  return {
    number: 1,
    size: DEFAULT_SIZE,
    mineCount: DEFAULT_MINE_COUNT,
    participants: [],
    selectedPlayer: null,
    status: 'ready',
    remainingSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    cells: createBoard(DEFAULT_SIZE),
  }
}

export function createNextChallenge(
  currentChallenge: ChallengeDocument,
): ChallengeDocument {
  return {
    ...currentChallenge,
    number: currentChallenge.number + 1,
    size: DEFAULT_SIZE,
    mineCount: DEFAULT_MINE_COUNT,
    participants: [],
    selectedPlayer: null,
    status: 'ready',
    remainingSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    cells: createBoard(DEFAULT_SIZE),
  }
}