import prisma from '@/lib/db'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Avatar, Badge, Button, Card } from '@/components'

async function getMatches() {
  return prisma.match.findMany({
    orderBy: { playedAt: 'desc' },
    include: {
      player1: true,
      player2: true,
    },
    take: 50,
  })
}

export default async function MatchesPage() {
  const matches = await getMatches()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎾 Match History</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All recorded matches in the league ({matches.length} total)
          </p>
        </div>
        <Link href="/matches/new">
          <Button icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Record Match
          </Button>
        </Link>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Players
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Winner
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No matches recorded yet.
                      </p>
                      <Link href="/matches/new">
                        <Button variant="outline" size="sm" className="mt-4">
                          Record the first match
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                matches.map((match) => {
                  const player1Won = match.winnerId === match.player1Id
                  const player2Won = match.winnerId === match.player2Id
                  const winner = player1Won ? match.player1 : player2Won ? match.player2 : null

                  return (
                    <tr
                      key={match.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col">
                          <span>{formatDate(match.playedAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar name={match.player1.name} size="sm" />
                            <span className={`text-sm font-medium ${player1Won ? 'text-primary-600 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                              {match.player1.name}
                            </span>
                          </div>
                          <span className="text-gray-400">vs</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${player2Won ? 'text-primary-600 font-semibold' : 'text-gray-900 dark:text-white'}`}>
                              {match.player2.name}
                            </span>
                            <Avatar name={match.player2.name} size="sm" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={player1Won || player2Won ? 'success' : 'default'}
                          className="font-mono text-sm"
                        >
                          {match.player1Score} - {match.player2Score}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {match.bestOf > 1 ? `Best of ${match.bestOf}` : 'Single'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {winner ? (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {winner.name}
                            </span>
                          </div>
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