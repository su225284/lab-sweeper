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
  updatedAt?: Timestamp
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

  return snapshot.data() as ChallengeDocument
}

export function subscribeCurrentChallenge(
  onChange: (challenge: ChallengeDocument) => void,
) {
  return onSnapshot(currentChallengeRef, (snapshot) => {
    if (!snapshot.exists()) return

    onChange(snapshot.data() as ChallengeDocument)
  })
}

const historyCollectionRef = collection(db, 'history')

export async function saveChallengeHistory(
challenge: ChallengeDocument,
result: ChallengeResult,
) {
await setDoc(doc(historyCollectionRef, `challenge-${challenge.number}`), {
  ...challenge,
  result,
  finishedAt: serverTimestamp(),
})
}

export type ChallengeHistoryDocument = ChallengeDocument & {
  result: ChallengeResult
  finishedAt?: Timestamp
}

export async function loadChallengeHistories() {
  const snapshot = await getDocs(historyCollectionRef)

  return snapshot.docs.map((doc) => doc.data() as ChallengeHistoryDocument)
}