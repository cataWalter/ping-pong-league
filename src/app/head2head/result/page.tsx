'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Avatar, Badge, Button, Card } from '@/components'
import { formatDate, calculateWinRate } from '@/lib/utils'

interface Player {
  id: string
  name: string
  avatar: string | null
  department: string | null
  rating: number
  wins: number
  losses: number
  draws: number
  streak: number
  totalPoints: number
  totalLostPoints: number
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedAt: string
  }>
}

interface Match {
  id: string
  player1Id: string
  player2Id: string
  player1Score: number
  player2Score: number
  winnerId: string | null
  playedAt: string
}

interface HeadToHeadData {
  player1: Player
  player2: Player
  matches: Match[]
  player1Wins: number
  player2Wins: number
  draws: number
  totalMatches: number
  player1WinRate: number
  player2WinRate: number
  averageScore1: number
  averageScore2: number
}

export default function HeadToHeadResultPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<HeadToHeadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const player1Id = searchParams.get('player1')
  const player2Id = searchParams.get('player2')

  useEffect(() => {
    if (player1Id && player2Id) {
      fetchHeadToHeadData(player1Id, player2Id)
    } else {
      setError('Missing player parameters')
      setLoading(false)
    }
  }, [player1Id, player2Id])

  const fetchHeadToHeadData = async (p1Id: string, p2Id: string) => {
    try {
      const response = await fetch(`/api/head2head?player1=${p1Id}&player2=${p2Id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch head-to-head data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading head-to-head data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Failed to load head-to-head data'}</p>
            <Link href="/head2head">
              <Button>Back to Head-to-Head</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const { player1, player2, matches, player1Wins, player2Wins, draws, totalMatches, player1WinRate, player2WinRate, averageScore1, averageScore2 } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/head2head" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Head-to-Head
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Head-to-Head Results</h1>
            <Link href="/head2head">
              <Button>Compare New Players</Button>
            </Link>
          </div>
        </div>

        {/* Player Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Player 1 Card */}
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar name={player1.name} src={player1.avatar} size="lg" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{player1.name}</h2>
                {player1.department && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{player1.department}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{player1.rating}</div>
                <div className="text-sm text-gray-500">ELO Rating</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{player1.wins}</div>
                <div className="text-sm text-gray-500">Wins</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{calculateWinRate(player1.wins, player1.losses)}%</div>
                <div className="text-sm text-gray-500">Win Rate</div>
              </div>
            </div>
          </Card>

          {/* Player 2 Card */}
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar name={player2.name} src={player2.avatar} size="lg" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{player2.name}</h2>
                {player2.department && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{player2.department}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{player2.rating}</div>
                <div className="text-sm text-gray-500">ELO Rating</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{player2.wins}</div>
                <div className="text-sm text-gray-500">Wins</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{calculateWinRate(player2.wins, player2.losses)}%</div>
                <div className="text-sm text-gray-500">Win Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Head-to-Head Stats */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Head-to-Head Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{player1Wins}</div>
              <div className="text-sm text-gray-500">{player1.name} Wins</div>
              <div className="text-xs text-gray-400">{player1WinRate}% win rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{draws}</div>
              <div className="text-sm text-gray-500">Draws</div>
              <div className="text-xs text-gray-400">{totalMatches > 0 ? Math.round((draws / totalMatches) * 100) : 0}% of matches</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{player2Wins}</div>
              <div className="text-sm text-gray-500">{player2.name} Wins</div>
              <div className="text-xs text-gray-400">{player2WinRate}% win rate</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{averageScore1.toFixed(1)}</div>
                <div className="text-sm text-gray-500">{player1.name} Avg Score</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{averageScore2.toFixed(1)}</div>
                <div className="text-sm text-gray-500">{player2.name} Avg Score</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Match History */}
        {matches.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Match History</h3>
            
            <div className="space-y-4">
              {matches.map((match) => {
                const player1Won = match.winnerId === player1.id
                const player2Won = match.winnerId === player2.id
                const isDraw = !match.winnerId

                return (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-12 rounded-full ${
                        player1Won ? 'bg-green-500' : player2Won ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">{player1.name}</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{match.player1Score}</span>
                          <span className="text-gray-500">-</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{match.player2Score}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{player2.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(match.playedAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {player1Won ? (
                        <Badge variant="success">{player1.name} Won</Badge>
                      ) : player2Won ? (
                        <Badge variant="error">{player2.name} Won</Badge>
                      ) : (
                        <Badge variant="default">Draw</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}