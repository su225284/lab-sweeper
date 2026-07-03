import type { Cell } from './types'

export function createBoard(size: number): Cell[] {
  return Array.from({ length: size * size }, (_, id) => ({
    id,
    opened: false,
    flagged: false,
    hasMine: false,
    count: 0,
  }))
}