'use client'

import { useState, useEffect } from 'react'
import { calculateWinRate } from '@/lib/utils'
import Link from 'next/link'
import { Avatar, Badge, Button, Card } from '@/components'
import RegisterPlayerForm from '@/components/RegisterPlayerForm'

interface Player {
  id: string
  name: string
  email: string
  avatar: string | null
  department: string | null
  rating: number
  wins: number
  losses: number
  draws: number
  streak: number
  totalPoints: number
  totalLostPoints: number
  createdAt: string
  updatedAt: string
  _count: {
    matchesAsPlayer1: number
    matchesAsPlayer2: number
  }
}

function getRatingBadge(rating: number) {
  if (rating >= 1400) return { label: 'Grand Master', color: 'bg-purple-100 text-purple-800' }
  if (rating >= 1300) return { label: 'Master', color: 'bg-yellow-100 text-yellow-800' }
  if (rating >= 1200) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' }
  if (rating >= 1100) return { label: 'Skilled', color: 'bg-green-100 text-green-800' }
  if (rating >= 1000) return { label: 'Intermediate', color: 'bg-gray-100 text-gray-800' }
  return { label: 'Beginner', color: 'bg-gray-100 text-gray-800' }
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error('Failed to fetch players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerRegistered = () => {
    fetchPlayers()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Players</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Loading players...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Players</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All registered players in the league ({players.length} total)
          </p>
        </div>
        <Button onClick={() => document.querySelector('details')?.click()}>
          Register Player
        </Button>
      </div>

      {players.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to join the league!</p>
          <Button onClick={() => document.querySelector('details')?.click()}>
            Register Player
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, index) => {
            const totalMatches = player._count.matchesAsPlayer1 + player._count.matchesAsPlayer2
            const winRate = calculateWinRate(player.wins, player.losses)
            const ratingBadge = getRatingBadge(player.rating)

            return (
              <Link key={player.id} href={`/players/${player.id}`} className="block">
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Avatar name={player.name} src={player.avatar} size="lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {player.name}
                        </h3>
                        {player.department && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {player.department}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="default" size="sm">{player.rating}</Badge>
                          <Badge className={ratingBadge.color} size="sm">{ratingBadge.label}</Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          #{index + 1}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {totalMatches} matches
                        </div>
                        {winRate !== null && (
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {winRate}% win rate
                          </div>
                        )}
                      </div>
                    </div>

                    {player.streak !== 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Current Streak</span>
                          <Badge 
                            variant={player.streak > 0 ? "success" : "error"} 
                            size="sm"
                          >
                            {player.streak > 0 ? `🔥 ${player.streak}` : `❄️ ${Math.abs(player.streak)}`}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Registration Dialog */}
      <details className="group">
        <summary className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Register New Player</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a new player to the league</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 z-50 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Register New Player
          </h3>
          <RegisterPlayerForm onSuccess={handlePlayerRegistered} />
        </div>
      </details>
    </div>
  )
}