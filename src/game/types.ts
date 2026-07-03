export type Cell = {
    id: number
    opened: boolean
    flagged: boolean
    hasMine: boolean
    count: number
  }
  
  export type ChallengeStatus =
    | 'ready'
    | 'playing'
    | 'cleared'
    | 'failed'
    | 'timeUp'
  
    export type ChallengeDocument = {
      number: number
      size: number
      mineCount: number
      participants: string[]
      selectedPlayer: string | null
      status: ChallengeStatus
      remainingSeconds: number
      cells: Cell[]
    
      finishedAt?: {
        seconds: number
        nanoseconds: number
      } | null
    }