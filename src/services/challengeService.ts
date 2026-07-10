import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'

import { db } from '../firebase'
import type { Cell } from '../game/types'

export type ChallengeStatus =
  | 'ready'
  | 'playing'
  | 'cleared'
  | 'failed'
  | 'timeUp'
export type ChallengeResult = 'cleared' | 'failed' | 'timeUp'

export type ChallengeDocument = {
  number: number
  size: number
  mineCount: number
  participants: string[]
  selectedPlayer: string | null
  status: ChallengeStatus
  remainingSeconds: number
  cells: Cell[]

  confirmedCells: Cell[]
  explosionCount: number
  
  updatedAt?: Timestamp

  participantCount?: number
  openedSafeCount?: number
  safeCellCount?: number
  progressRate?: number
}

function normalizeChallenge(
  data: Partial<ChallengeDocument>,
): ChallengeDocument {
  const cells = data.cells ?? []

  return {
    ...data,
    cells,
    confirmedCells:
      data.confirmedCells ??
      cells.map((cell) => ({
        ...cell,
      })),
    explosionCount: data.explosionCount ?? 0,
  } as ChallengeDocument
}

const currentChallengeRef = doc(db, 'currentChallenge', 'current')

export async function saveCurrentChallenge(challenge: ChallengeDocument) {
  await setDoc(
    currentChallengeRef,
    {
      ...challenge,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function loadCurrentChallenge() {
  const snapshot = await getDoc(currentChallengeRef)

  if (!snapshot.exists()) {
    return null
  }

  return normalizeChallenge(
    snapshot.data() as Partial<ChallengeDocument>,
  )
}

export function subscribeCurrentChallenge(
  onChange: (challenge: ChallengeDocument) => void,
) {
  return onSnapshot(currentChallengeRef, (snapshot) => {
    if (!snapshot.exists()) return

    onChange(
      normalizeChallenge(
        snapshot.data() as Partial<ChallengeDocument>,
      ),
    )
  })
}

const historyCollectionRef = collection(db, 'history')

export async function saveChallengeHistory(
  challenge: ChallengeDocument,
  result: ChallengeResult,
) {
  const safeCellCount = challenge.cells.filter(
    (cell) => !cell.hasMine
  ).length

  const openedSafeCount = challenge.cells.filter(
    (cell) => !cell.hasMine && cell.opened
  ).length

  const progressRate =
    result === 'cleared'
      ? 100
      : safeCellCount === 0
        ? 0
        : Math.round((openedSafeCount / safeCellCount) * 100)

  const historyParticipants =
    challenge.selectedPlayer &&
    !challenge.participants.includes(challenge.selectedPlayer)
      ? [...challenge.participants, challenge.selectedPlayer]
      : challenge.participants

  const historyRef = doc(
    historyCollectionRef,
    `challenge-${challenge.number}`,
  )

  await setDoc(historyRef, {
    ...challenge,
    participants: historyParticipants,
    participantCount: historyParticipants.length,
    status: result,
    openedSafeCount,
    safeCellCount,
    progressRate,
    finishedAt: serverTimestamp(),
  })
}

export type ChallengeHistoryDocument = ChallengeDocument & {
  status: ChallengeResult
  finishedAt?: Timestamp
}

export async function loadChallengeHistories() {
  const snapshot = await getDocs(historyCollectionRef)

  return snapshot.docs.map((doc) => doc.data() as ChallengeHistoryDocument)
}