import { getNeighbors } from './getNeighbors'
import type { Cell } from './types'

export function calculateNumbers(cells: Cell[], size: number): Cell[] {
  return cells.map((cell) => {
    if (cell.hasMine) {
      return {
        ...cell,
        count: 0,
      }
    }

    const count = getNeighbors(cell.id, size).filter(
      (neighborId) => cells[neighborId]?.hasMine,
    ).length

    return {
      ...cell,
      count,
    }
  })
}