import { getNeighbors } from './getNeighbors'
import { openCells } from './openCells'
import type { Cell } from './types'

export function openAround(cells: Cell[], id: number, size: number): Cell[] {
  const targetCell = cells[id]

  if (!targetCell || !targetCell.opened || targetCell.hasMine) {
    return cells
  }

  const neighborIds = getNeighbors(id, size)
  const flaggedCount = neighborIds.filter(
    (neighborId) => cells[neighborId]?.flagged,
  ).length

  if (flaggedCount !== targetCell.count) {
    return cells
  }

  let nextCells = cells

  for (const neighborId of neighborIds) {
    const neighborCell = nextCells[neighborId]

    if (!neighborCell || neighborCell.opened || neighborCell.flagged) {
      continue
    }

    if (neighborCell.hasMine) {
      nextCells = nextCells.map((cell) =>
        cell.id === neighborId ? { ...cell, opened: true } : cell,
      )
    } else {
      nextCells = openCells(nextCells, neighborId, size)
    }
  }

  return nextCells
}