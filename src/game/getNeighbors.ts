export function getNeighbors(id: number, size: number): number[] {
    const row = Math.floor(id / size)
    const col = id % size
    const neighbors: number[] = []
  
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
  
        const nextRow = row + dr
        const nextCol = col + dc
  
        if (
          nextRow >= 0 &&
          nextRow < size &&
          nextCol >= 0 &&
          nextCol < size
        ) {
          neighbors.push(nextRow * size + nextCol)
        }
      }
    }
  
    return neighbors
  }