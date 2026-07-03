import { getNeighbors } from './getNeighbors'
import type { Cell } from './types'

export function placeMines(
  cells: Cell[],
  size: number,
  mineCount: number,
  safeId: number,
): Cell[] {
  const safeIds = new Set<number>([safeId, ...getNeighbors(safeId, size)])
  const mineIds = new Set<number>()

  while (mineIds.size < mineCount) {
    const id = Math.floor(Math.random() * cells.length)

    if (safeIds.has(id)) continue

    mineIds.add(id)
  }

  return cells.map((cell) => ({
    ...cell,
    hasMine: mineIds.has(cell.id),
  }))
}