import type { Cell } from './types'
import { getNeighbors } from './getNeighbors'

export function createBoard(size: number, mineCount: number): Cell[] {
  const mineIds = new Set<number>()

  while (mineIds.size < mineCount) {
    mineIds.add(Math.floor(Math.random() * size * size))
  }

  return Array.from({ length: size * size }, (_, id) => {
    const neighbors = getNeighbors(id, size)
    const count = neighbors.filter((neighborId) => mineIds.has(neighborId)).length

    return {
        id,
        opened: false,
        flagged: false,
        hasMine: mineIds.has(id),
        count,
      }
  })
}