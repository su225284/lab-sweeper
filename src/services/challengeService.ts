import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
  
  import { db } from '../firebase'
  import type { Cell } from '../game/types'
  
  export type ChallengeStatus = 'ready' | 'playing' | 'cleared' | 'timeUp'
  
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