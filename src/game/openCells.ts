import { getNeighbors } from './getNeighbors'
import type { Cell } from './types'

export function openCells(cells: Cell[], startId: number, size: number): Cell[] {
  const openedIds = new Set<number>()
  const queue = [startId]

  while (queue.length > 0) {
    const id = queue.shift()
    if (id === undefined || openedIds.has(id)) continue

    const cell = cells[id]
    if (!cell || cell.hasMine) continue

    openedIds.add(id)

    if (cell.count === 0) {
      const neighbors = getNeighbors(id, size)
      for (const neighborId of neighbors) {
        if (!openedIds.has(neighborId)) {
          queue.push(neighborId)
        }
      }
    }
  }

  return cells.map((cell) =>
    openedIds.has(cell.id) ? { ...cell, opened: true } : cell,
  )
}