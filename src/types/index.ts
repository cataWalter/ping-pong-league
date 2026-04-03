export interface Player {
  id: string
  name: string
  email: string
  rating: number
  wins: number
  losses: number
  draws: number
  createdAt: Date
  updatedAt: Date
}

export interface Match {
  id: string
  player1Id: string
  player2Id: string
  player1Score: number
  player2Score: number
  winnerId: string | null
  playedAt: Date
  player1?: Player
  player2?: Player
}

export interface LeaderboardEntry {
  rank: number
  player: Player
  winRate: number
}

export interface Tournament {
  id: string
  name: string
  type: 'elimination' | 'round-robin'
  status: 'pending' | 'active' | 'completed'
  startDate: Date | null
  endDate: Date | null
}