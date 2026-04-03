import prisma from '@/lib/db'
import { formatDate, calculateWinRate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getHeadToHead(player1Id: string, player2Id: string) {
  const player1 = await prisma.player.findUnique({
    where: { id: player1Id },
    include: { achievements: true },
  })

  const player2 = await prisma.player.findUnique({
    where: { id: player2Id },
    include: { achievements: true },
  })

  if (!player1 || !player2) return null

  // Get all matches between these two players
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { player1Id, player2Id },
        { player1Id: player2Id, player2Id: player1Id },
      ],
    },
    orderBy: { playedAt: 'desc' },
  })

  // Calculate head-to-head stats
  let player1Wins = 0
  let player2Wins = 0
  let draws = 0
  let player1TotalPoints = 0
  let player2TotalPoints = 0

  matches.forEach((match) => {
    player1TotalPoints += match.player1Score
    player2TotalPoints += match.player2Score

    if (match.winnerId === player1Id) player1Wins++
    else if (match.winnerId === player2Id) player2Wins++
    else draws++
  })

  const totalMatches = matches.length

  return {
    player1,
    player2,
    matches,
    stats: {
      player1Wins,
      player2Wins,
      draws,
      totalMatches,
      player1TotalPoints,
      player2TotalPoints,
      player1AvgPoints: totalMatches > 0 ? (player1TotalPoints / totalMatches).toFixed(1) : '0',
      player2AvgPoints: totalMatches > 0 ? (player2TotalPoints / totalMatches).toFixed(1) : '0',
    },
  }
}

export default async function HeadToHeadResultPage({
  searchParams,
}: {
  searchParams: { player1?: string; player2?: string }
}) {
  if (!searchParams.player1 || !searchParams.player2) {
    notFound()
  }

  const result = await getHeadToHead(searchParams.player1, searchParams.player2)

  if (!result) {
    notFound()
  }

  const { player1, player2, matches, stats } = result

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <Link href="/head2head" className="text-sm text-primary-600 hover:text-primary-500">
          ← Back to Head-to-Head
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {player1.name} vs {player2.name}
        </h1>
      </div>

      {/* Main Comparison */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Player 1 */}
          <div>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-primary-700">
                {player1.name.charAt(0)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{player1.name}</h2>
            <p className="text-sm text-gray-500">Rating: {Math.round(player1.rating)}</p>
            <div className="mt-4 space-y-2">
              <p className="text-3xl font-bold text-green-600">{stats.player1Wins}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
          </div>

          {/* VS / Total */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-300 mb-2">VS</div>
            <div className="text-sm text-gray-500">
              {stats.totalMatches} matches played
            </div>
            {stats.draws > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                {stats.draws} draws
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div>
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-gray-700">
                {player2.name.charAt(0)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{player2.name}</h2>
            <p className="text-sm text-gray-500">Rating: {Math.round(player2.rating)}</p>
            <div className="mt-4 space-y-2">
              <p className="text-3xl font-bold text-green-600">{stats.player2Wins}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
          </div>
        </div>

        {/* Win Rate Bar */}
        {stats.totalMatches > 0 && (
          <div className="mt-6">
            <div className="flex h-8 rounded-full overflow-hidden">
              <div
                className="bg-primary-600 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${(stats.player1Wins / stats.totalMatches) * 100}%` }}
              >
                {stats.player1Wins > 0 && `${Math.round((stats.player1Wins / stats.totalMatches) * 100)}%`}
              </div>
              {stats.draws > 0 && (
                <div
                  className="bg-gray-400 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${(stats.draws / stats.totalMatches) * 100}%` }}
                >
                  {Math.round((stats.draws / stats.totalMatches) * 100)}%
                </div>
              )}
              <div
                className="bg-gray-600 flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${(stats.player2Wins / stats.totalMatches) * 100}%` }}
              >
                {stats.player2Wins > 0 && `${Math.round((stats.player2Wins / stats.totalMatches) * 100)}%`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Player 1 Stats */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{player1.name}</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Win Rate</dt>
              <dd className="text-lg font-semibold">
                {stats.totalMatches > 0 ? calculateWinRate(stats.player1Wins, stats.player2Wins) : 0}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Avg Points</dt>
              <dd className="text-lg font-semibold">{stats.player1AvgPoints}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total Points</dt>
              <dd className="text-lg font-semibold">{stats.player1TotalPoints}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Overall Record</dt>
              <dd className="text-lg font-semibold">{player1.wins}W - {player1.losses}L</dd>
            </div>
          </dl>
        </div>

        {/* Player 2 Stats */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{player2.name}</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Win Rate</dt>
              <dd className="text-lg font-semibold">
                {stats.totalMatches > 0 ? calculateWinRate(stats.player2Wins, stats.player1Wins) : 0}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Avg Points</dt>
              <dd className="text-lg font-semibold">{stats.player2AvgPoints}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total Points</dt>
              <dd className="text-lg font-semibold">{stats.player2TotalPoints}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Overall Record</dt>
              <dd className="text-lg font-semibold">{player2.wins}W - {player2.losses}L</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Match History */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Match History</h3>
        {matches.length === 0 ? (
          <p className="text-gray-500 text-sm">These players haven't played each other yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matches.map((match) => {
                  const winner = match.winnerId === player1.id ? player1 : match.winnerId === player2.id ? player2 : null
                  return (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(match.playedAt)}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {match.player1Score} - {match.player2Score}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {winner ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {winner.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draw
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}