import prisma from '@/lib/db'
import { formatDate, calculateWinRate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Avatar, Badge, Button, Card } from '@/components'
import RatingChart from '@/components/RatingChart'

// Generate static params for all players
export async function generateStaticParams() {
  const players = await prisma.player.findMany({
    select: { id: true }
  })
  
  return players.map((player) => ({
    id: player.id,
  }))
}

async function getPlayer(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      matchesAsPlayer1: {
        orderBy: { playedAt: 'desc' },
        take: 50,
        include: { player2: true },
      },
      matchesAsPlayer2: {
        orderBy: { playedAt: 'desc' },
        take: 50,
        include: { player1: true },
      },
      achievements: {
        orderBy: { earnedAt: 'desc' },
      },
      ratingHistory: {
        orderBy: { createdAt: 'asc' },
        take: 50,
      },
    },
  })

  if (!player) return null
  return player
}

function getRatingLevel(rating: number) {
  if (rating >= 1400) return { label: 'Grand Master', color: 'bg-purple-100 text-purple-800' }
  if (rating >= 1300) return { label: 'Master', color: 'bg-yellow-100 text-yellow-800' }
  if (rating >= 1200) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' }
  if (rating >= 1100) return { label: 'Skilled', color: 'bg-green-100 text-green-800' }
  if (rating >= 1000) return { label: 'Intermediate', color: 'bg-gray-100 text-gray-800' }
  return { label: 'Beginner', color: 'bg-gray-100 text-gray-800' }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id)

  if (!player) {
    notFound()
  }

  // Combine and sort all matches
  const allMatches = [
    ...player.matchesAsPlayer1.map((m) => ({
      ...m,
      opponent: m.player2,
      isPlayer1: true as const,
    })),
    ...player.matchesAsPlayer2.map((m) => ({
      ...m,
      opponent: m.player1,
      isPlayer1: false as const,
    })),
  ].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())

  const winRate = calculateWinRate(player.wins, player.losses)
  const totalMatches = player.wins + player.losses + player.draws
  const ratingLevel = getRatingLevel(player.rating)

  // Prepare rating history data for chart
  const ratingHistoryData = player.ratingHistory.map((rh) => ({
    date: formatDate(rh.createdAt),
    rating: rh.rating,
  }))

  // Calculate rating trend
  const recentRatings = player.ratingHistory.slice(-10)
  const ratingTrend = recentRatings.length >= 2
    ? recentRatings[recentRatings.length - 1].rating - recentRatings[0].rating
    : 0

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex items-center gap-6">
            <Avatar name={player.name} src={player.avatar} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{player.name}</h1>
                <Badge variant="default" className={ratingLevel.color}>
                  {ratingLevel.label}
                </Badge>
              </div>
              <p className="text-primary-100">{player.email}</p>
              {player.department && (
                <p className="text-primary-100 mt-1">{player.department}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(player.rating)}
            </p>
            {ratingTrend !== 0 && (
              <p className={`text-sm ${ratingTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ratingTrend > 0 ? '+' : ''}{Math.round(ratingTrend)} recent
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Wins</p>
            <p className="text-3xl font-bold text-green-600">{player.wins}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Losses</p>
            <p className="text-3xl font-bold text-red-600">{player.losses}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{winRate}%</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            <Link href={`/head2head?player1=${player.id}`}>
              <Button variant="outline" size="sm">
                Head-to-Head
              </Button>
            </Link>
            <Link href={`/head2head?player2=${player.id}`}>
              <Button variant="outline" size="sm">
                Compare
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Rating History Chart */}
      {ratingHistoryData.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rating History
          </h3>
          <div className="h-64">
            <RatingChart data={ratingHistoryData} height={240} />
          </div>
        </Card>
      )}

      {/* Achievements */}
      {player.achievements.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🏆 Achievements ({player.achievements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {player.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
              >
                <span className="text-3xl mb-2">{achievement.icon}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                  {achievement.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {formatDate(achievement.earnedAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Match History */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Match History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Opponent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {allMatches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No matches played yet.
                  </td>
                </tr>
              ) : (
                allMatches.map((match) => {
                  const playerScore = match.isPlayer1 ? match.player1Score : match.player2Score
                  const opponentScore = match.isPlayer1 ? match.player2Score : match.player1Score
                  const won = playerScore > opponentScore
                  const lost = playerScore < opponentScore

                  return (
                    <tr
                      key={match.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(match.playedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/players/${match.opponent.id}`}
                          className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                        >
                          <Avatar name={match.opponent.name} size="sm" />
                          {match.opponent.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={won ? 'success' : lost ? 'error' : 'default'}
                          className="font-mono"
                        >
                          {playerScore} - {opponentScore}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {won ? (
                          <Badge variant="success" size="sm">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Win
                            </span>
                          </Badge>
                        ) : lost ? (
                          <Badge variant="error" size="sm">Loss</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Draw</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}