import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
  } from 'firebase/firestore'
  import { db } from '../firebase'
  
  const settingsRef = doc(db, 'settings', 'current')
  
  export async function saveBoardSize(boardSize: number) {
    await setDoc(
      settingsRef,
      { boardSize },
      { merge: true },
    )
  }
  
  export async function loadBoardSize() {
    const snapshot = await getDoc(settingsRef)
  
    if (!snapshot.exists()) {
      return 20
    }
  
    return snapshot.data().boardSize ?? 20
  }
  
  export function subscribeBoardSize(
    callback: (boardSize: number) => void,
  ) {
    return onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(20)
        return
      }
  
      callback(snapshot.data().boardSize ?? 20)
    })
  }