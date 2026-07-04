import {
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc,
  } from 'firebase/firestore'
  import { db } from '../firebase'

const DEFAULT_MEMBERS = ['山田', '田中', '鈴木', '佐藤']

const membersRef = doc(db, 'settings', 'members')

export async function getMembers(): Promise<string[]> {
  const snapshot = await getDoc(membersRef)

  if (!snapshot.exists()) {
    await setDoc(membersRef, {
      names: DEFAULT_MEMBERS,
    })

    return DEFAULT_MEMBERS
  }

  const data = snapshot.data()
  return Array.isArray(data.names) ? data.names : DEFAULT_MEMBERS
}

export async function saveMembers(members: string[]) {
  await setDoc(membersRef, {
    names: members,
  })
}

export function subscribeMembers(
  onChange: (members: string[]) => void,
) {
  return onSnapshot(membersRef, async (snapshot) => {
    if (!snapshot.exists()) {
      await setDoc(membersRef, {
        names: DEFAULT_MEMBERS,
      })

      onChange(DEFAULT_MEMBERS)
      return
    }

    const data = snapshot.data()
    onChange(Array.isArray(data.names) ? data.names : DEFAULT_MEMBERS)
  })
}

export async function addMember(memberName: string) {
    await updateDoc(membersRef, {
      names: arrayUnion(memberName),
    })
  }
  
  export async function removeMember(memberName: string) {
    await updateDoc(membersRef, {
      names: arrayRemove(memberName),
    })
  }