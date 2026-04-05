import prisma from '@/lib/db'
import Link from 'next/link'
import { formatDate, calculateWinRate } from '@/lib/utils'
import { Avatar, Badge, Card } from '@/components'

async function getRecentMatches() {
  return prisma.match.findMany({
    take: 5,
    orderBy: { playedAt: 'desc' },
    include: {
      player1: true,
      player2: true,
    },
  })
}

async function getTopPlayers() {
  return prisma.player.findMany({
    take: 5,
    orderBy: { rating: 'desc' },
  })
}

async function getStats() {
  const totalPlayers = await prisma.player.count()
  const totalMatches = await prisma.match.count()
  const totalAchievements = await prisma.achievement.count()
  return { totalPlayers, totalMatches, totalAchievements }
}

async function getActiveStreaks() {
  return prisma.player.findMany({
    take: 3,
    orderBy: { streak: 'desc' },
    where: { streak: { gt: 0 } },
  })
}

export default async function Home() {
  const [recentMatches, topPlayers, stats, activeStreaks] = await Promise.all([
    getRecentMatches(),
    getTopPlayers(),
    getStats(),
    getActiveStreaks(),
  ])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNjBMNjAgMEgwTDYwIDYwWiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl sm:text-5xl">🏓</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Ping Pong League
            </h1>
          </div>
          <p className="max-w-2xl text-lg text-primary-100 mb-8">
            Track your matches, climb the leaderboard, and become the office champion.
            Features advanced ELO ratings, achievement tracking, and comprehensive statistics.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/matches/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-primary-700 bg-white hover:bg-primary-50 transition-all hover:scale-105"
            >
              Record a Match
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-base font-medium rounded-xl text-white hover:bg-white/10 transition-all"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-100 bg-primary-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Players</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPlayers}</p>
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 bg-blue-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Matches</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMatches}</p>
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-100 bg-yellow-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Achievements</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAchievements}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Matches */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Matches</h3>
            <Link href="/matches" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {recentMatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No matches recorded yet.</p>
                <Link href="/matches/new" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">
                  Record the first match →
                </Link>
              </div>
            ) : (
              recentMatches.map((match, index) => {
                const player1Won = match.winnerId === match.player1Id
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 800/50 hover:bg-gray-100 hover:bg-gray-800 transition-colors"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar name={match.player1.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          <span className={player1Won ? 'text-primary-600 font-semibold' : ''}>
                            {match.player1.name}
                          </span>
                          {' vs '}
                          <span className={match.winnerId === match.player2Id ? 'text-primary-600 font-semibold' : ''}>
                            {match.player2.name}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(match.playedAt)}</p>
                      </div>
                    </div>
                    <Badge variant="default" className="ml-4 font-mono">
                      {match.player1Score} - {match.player2Score}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Top Players */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Players</h3>
            <Link href="/leaderboard" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {topPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No players registered yet.</p>
              </div>
            ) : (
              topPlayers.map((player, index) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 hover:bg-gray-800/50 transition-colors group"
                >
                  <Avatar
                    name={player.name}
                    size="md"
                    showRank
                    rank={index + 1}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {player.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {player.wins}W - {player.losses}L • {calculateWinRate(player.wins, player.losses)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">{Math.round(player.rating)}</p>
                    <p className="text-xs text-gray-500">rating</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Active Streaks */}
      {activeStreaks.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              🔥 Hot Streaks
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeStreaks.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 from-orange-900/20 to-red-900/20 border border-orange-100 border-orange-800"
              >
                <Avatar name={player.name} size="md" />
                <div>
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-orange-600 text-orange-400 font-semibold">
                    {player.streak} win streak
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}