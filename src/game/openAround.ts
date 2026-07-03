import { getNeighbors } from './getNeighbors'
import { openCells } from './openCells'
import type { Cell } from './types'

type OpenAroundResult = {
  cells: Cell[]
  exploded: boolean
}

export function openAround(
  cells: Cell[],
  id: number,
  size: number,
): OpenAroundResult {
  const targetCell = cells[id]

  if (!targetCell || !targetCell.opened || targetCell.hasMine) {
    return { cells, exploded: false }
  }

  const neighborIds = getNeighbors(id, size)
  const flaggedCount = neighborIds.filter(
    (neighborId) => cells[neighborId]?.flagged,
  ).length

  if (flaggedCount !== targetCell.count) {
    return { cells, exploded: false }
  }

  let nextCells = cells
  let exploded = false

  for (const neighborId of neighborIds) {
    const neighborCell = nextCells[neighborId]

    if (!neighborCell || neighborCell.opened || neighborCell.flagged) {
      continue
    }

    if (neighborCell.hasMine) {
      exploded = true
      nextCells = nextCells.map((cell) =>
        cell.id === neighborId ? { ...cell, opened: true } : cell,
      )
      continue
    }

    nextCells = openCells(nextCells, neighborId, size)
  }

  return { cells: nextCells, exploded }
}