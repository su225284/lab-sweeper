const STORAGE_KEY = 'members'

const DEFAULT_MEMBERS = [
  '山田',
  '田中',
  '鈴木',
  '佐藤',
]

export function getMembers(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return DEFAULT_MEMBERS
  }

  try {
    return JSON.parse(saved)
  } catch {
    return DEFAULT_MEMBERS
  }
}

export function saveMembers(members: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}