import prisma from '@/lib/db'
import { calculateWinRate, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Avatar, Badge, Card } from '@/components'

async function getStats() {
  const players = await prisma.player.findMany({
    include: {
      achievements: true,
      ratingHistory: {
        orderBy: { createdAt: 'asc' },
        take: 100,
      },
    },
  })

  const matches = await prisma.match.findMany({
    include: {
      player1: true,
      player2: true,
    },
    orderBy: { playedAt: 'desc' },
    take: 100,
  })

  const totalMatches = await prisma.match.count()
  const totalPlayers = await prisma.player.count()

  const avgRating =
    players.reduce((sum, p) => sum + p.rating, 0) / (players.length || 1)

  const highestRating = Math.max(...players.map((p) => p.rating), 0)
  const lowestRating = Math.min(...players.map((p) => p.rating), 1000)

  const longestStreak = Math.max(...players.map((p) => p.bestStreak), 0)

  const mostActivePlayer = players.reduce((max, p) => {
    const matches = p.wins + p.losses + p.draws
    return matches > (max.matches || 0) ? { player: p, matches } : max
  }, { player: null as typeof players[0] | null, matches: 0 })

  const recentMatches = matches.slice(0, 10)
  const recentWinners = recentMatches.map((m) =>
    m.winnerId === m.player1Id ? m.player1.name : m.winnerId === m.player2Id ? m.player2.name : 'Draw'
  )

  const ratingBrackets = {
    '1400+': players.filter((p) => p.rating >= 1400).length,
    '1300-1399': players.filter((p) => p.rating >= 1300 && p.rating < 1400).length,
    '1200-1299': players.filter((p) => p.rating >= 1200 && p.rating < 1300).length,
    '1100-1199': players.filter((p) => p.rating >= 1100 && p.rating < 1200).length,
    '1000-1099': players.filter((p) => p.rating >= 1000 && p.rating < 1100).length,
    '<1000': players.filter((p) => p.rating < 1000).length,
  }

  const topRated = [...players].sort((a, b) => b.rating - a.rating).slice(0, 5)
  const mostWins = [...players].sort((a, b) => b.wins - a.wins).slice(0, 5)
  const bestWinRate = [...players]
    .filter((p) => p.wins + p.losses >= 3)
    .sort((a, b) => calculateWinRate(b.wins, b.losses) - calculateWinRate(a.wins, a.losses))
    .slice(0, 5)

  const sortedMatches = [...matches].sort((a, b) => 
    new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
  )
  
  let totalHours = 0
  let matchPairs = 0
  for (let i = 1; i < sortedMatches.length; i++) {
    const diff = new Date(sortedMatches[i].playedAt).getTime() - new Date(sortedMatches[i-1].playedAt).getTime()
    totalHours += diff / (1000 * 60 * 60)
    matchPairs++
  }
  const avgHoursBetweenMatches = matchPairs > 0 ? Math.round(totalHours / matchPairs) : 0

  return {
    players,
    matches,
    totalMatches,
    totalPlayers,
    avgRating: Math.round(avgRating),
    highestRating: Math.round(highestRating),
    lowestRating: Math.round(lowestRating),
    longestStreak,
    mostActivePlayer,
    recentWinners,
    ratingBrackets,
    topRated,
    mostWins,
    bestWinRate,
    avgHoursBetweenMatches,
  }
}

export default async function StatsPageContent() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Statistics & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive league statistics and player analytics
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Matches"
          value={stats.totalMatches}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Total Players"
          value={stats.totalPlayers}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          label="Highest Rating"
          value={stats.highestRating}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          color="yellow"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.ratingBrackets).map(([bracket, count]) => {
              const percentage = stats.totalPlayers > 0 ? (count / stats.totalPlayers) * 100 : 0
              const colors: Record<string, string> = {
                '1400+': 'bg-purple-500',
                '1300-1399': 'bg-yellow-500',
                '1200-1299': 'bg-blue-500',
                '1100-1199': 'bg-green-500',
                '1000-1099': 'bg-gray-500',
                '<1000': 'bg-gray-400',
              }
              return (
                <div key={bracket}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 text-gray-400">{bracket}</span>
                    <span className="text-gray-900 text-white font-medium">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 bg-gray-700 rounded-full h-3">
                    <div
                      className={`${colors[bracket]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Winners</h3>
          <div className="flex flex-wrap gap-2">
            {stats.recentWinners.length === 0 ? (
              <p className="text-gray-500 text-gray-400 text-sm">No recent matches</p>
            ) : (
              stats.recentWinners.map((winner, index) => (
                <Badge key={index} variant="success" size="sm">
                  {winner}
                </Badge>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Players</h3>
          <div className="space-y-3">
            {stats.topRated.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`
                    flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
                    ${index === 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${index === 1 ? 'bg-gray-100 text-gray-800' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-800' : ''}
                    ${index > 2 ? 'bg-gray-100 bg-gray-700 text-gray-600 text-gray-300' : ''}
                  `}>
                    {index + 1}
                  </span>
                  <Link href={`/players/${player.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                    {player.name}
                  </Link>
                </div>
                <Badge variant="rating">{Math.round(player.rating)}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Wins</h3>
          <div className="space-y-3">
            {stats.mostWins.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium bg-gray-100 bg-gray-700 text-gray-600 text-gray-300">
                    {index + 1}
                  </span>
                  <Link href={`/players/${player.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                    {player.name}
                  </Link>
                </div>
                <Badge variant="success">{player.wins} wins</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Win Rate (min 3 matches)</h3>
          <div className="space-y-3">
            {stats.bestWinRate.map((player, index) => {
              const winRate = calculateWinRate(player.wins, player.losses)
              return (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium bg-gray-100 bg-gray-700 text-gray-600 text-gray-300">
                      {index + 1}
                    </span>
                    <Link href={`/players/${player.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                      {player.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{winRate}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {stats.players
              .flatMap((p) => p.achievements.map((a) => ({ ...a, playerName: p.name, playerId: p.id })))
              .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
              .slice(0, 10)
              .map((achievement, index) => (
                <Link
                  key={index}
                  href={`/players/${achievement.playerId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{achievement.name}</p>
                    <p className="text-xs text-gray-500 truncate">{achievement.playerName}</p>
                  </div>
                </Link>
              ))}
            {stats.players.flatMap((p) => p.achievements).length === 0 && (
              <p className="text-sm text-gray-500">No achievements earned yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight = false,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  highlight?: boolean
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 bg-blue-900/30 text-blue-600',
    green: 'bg-green-100 bg-green-900/30 text-green-600',
    purple: 'bg-purple-100 bg-purple-900/30 text-purple-600',
    yellow: 'bg-yellow-100 bg-yellow-900/30 text-yellow-600',
  }

  return (
    <Card hover className={highlight ? 'ring-2 ring-yellow-400' : ''}>
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}