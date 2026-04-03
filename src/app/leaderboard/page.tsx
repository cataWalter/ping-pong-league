import prisma from '@/lib/db'
import { calculateWinRate } from '@/lib/utils'
import Link from 'next/link'
import { Avatar, Badge, Card } from '@/components'

async function getLeaderboard() {
  const players = await prisma.player.findMany({
    orderBy: { rating: 'desc' },
    include: {
      _count: {
        select: {
          matchesAsPlayer1: true,
          matchesAsPlayer2: true,
        },
      },
    },
  })

  return players.map((player, index) => ({
    rank: index + 1,
    player,
    winRate: calculateWinRate(player.wins, player.losses),
    totalMatches: player._count.matchesAsPlayer1 + player._count.matchesAsPlayer2,
  }))
}

function getRatingLevel(rating: number): { label: string; color: string } {
  if (rating >= 1400) return { label: 'Grand Master', color: 'bg-purple-100 text-purple-800' }
  if (rating >= 1300) return { label: 'Master', color: 'bg-yellow-100 text-yellow-800' }
  if (rating >= 1200) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' }
  if (rating >= 1100) return { label: 'Skilled', color: 'bg-green-100 text-green-800' }
  if (rating >= 1000) return { label: 'Intermediate', color: 'bg-gray-100 text-gray-800' }
  return { label: 'Beginner', color: 'bg-gray-100 text-gray-800' }
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Current rankings based on ELO ratings
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🥇 Top Players</h3>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-center gap-4 sm:gap-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <Avatar
                  name={leaderboard[1].player.name}
                  size="lg"
                  showRank
                  rank={2}
                />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {leaderboard[1].player.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(leaderboard[1].player.rating)} rating
                </p>
                <div className="mt-4 w-20 sm:w-28 h-24 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-start justify-center pt-2">
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Avatar
                  name={leaderboard[0].player.name}
                  size="xl"
                  showRank
                  rank={1}
                />
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {leaderboard[0].player.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(leaderboard[0].player.rating)} rating
                </p>
                <div className="mt-4 w-24 sm:w-32 h-32 sm:h-40 bg-yellow-200 dark:bg-yellow-700 rounded-t-lg flex items-start justify-center pt-2">
                  <span className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <Avatar
                  name={leaderboard[2].player.name}
                  size="lg"
                  showRank
                  rank={3}
                />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {leaderboard[2].player.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(leaderboard[2].player.rating)} rating
                </p>
                <div className="mt-4 w-16 sm:w-24 h-16 sm:h-24 bg-orange-200 dark:bg-orange-700 rounded-t-lg flex items-start justify-center pt-2">
                  <span className="text-xl font-bold text-orange-700 dark:text-orange-300">3</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Full Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  W-L
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Win Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Matches
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No players registered yet. Be the first to join!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const level = getRatingLevel(entry.player.rating)
                  return (
                    <tr
                      key={entry.player.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                            ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${entry.rank === 2 ? 'bg-gray-100 text-gray-800' : ''}
                            ${entry.rank === 3 ? 'bg-orange-100 text-orange-800' : ''}
                            ${entry.rank > 3 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : ''}
                          `}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/players/${entry.player.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <Avatar name={entry.player.name} size="sm" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {entry.player.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default" size="sm" className={level.color}>
                          {level.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                          {Math.round(entry.player.rating)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {entry.player.wins} - {entry.player.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${entry.winRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{entry.winRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                        {entry.totalMatches}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rating Distribution</h3>
        </div>
        <div className="p-6">
          <RatingDistribution players={leaderboard.map((l) => l.player)} />
        </div>
      </Card>
    </div>
  )
}

async function RatingDistribution({ players }: { players: Array<{ rating: number }> }) {
  const brackets = [
    { label: 'Grand Master (1400+)', min: 1400, max: Infinity, color: 'bg-purple-500' },
    { label: 'Master (1300-1399)', min: 1300, max: 1400, color: 'bg-yellow-500' },
    { label: 'Expert (1200-1299)', min: 1200, max: 1300, color: 'bg-blue-500' },
    { label: 'Skilled (1100-1199)', min: 1100, max: 1200, color: 'bg-green-500' },
    { label: 'Intermediate (1000-1099)', min: 1000, max: 1100, color: 'bg-gray-500' },
    { label: 'Beginner (<1000)', min: 0, max: 1000, color: 'bg-gray-400' },
  ]

  const total = players.length || 1

  return (
    <div className="space-y-3">
      {brackets.map((bracket) => {
        const count = players.filter(
          (p) => p.rating >= bracket.min && p.rating < bracket.max
        ).length
        const percentage = (count / total) * 100

        return (
          <div key={bracket.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{bracket.label}</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {count} ({Math.round(percentage)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`${bracket.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}