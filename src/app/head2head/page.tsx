import prisma from '@/lib/db'
import { formatDate, calculateWinRate } from '@/lib/utils'
import Link from 'next/link'

async function getPlayers() {
  return prisma.player.findMany({
    orderBy: { name: 'asc' },
  })
}

export default async function HeadToHeadPage() {
  const players = await getPlayers()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Head-to-Head Comparison</h1>
        <p className="mt-1 text-sm text-gray-500">
          Compare any two players to see their historical matchups
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <form action="/head2head" method="GET">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-end">
            <div>
              <label htmlFor="player1" className="block text-sm font-medium text-gray-700">
                Player 1
              </label>
              <select
                id="player1"
                name="player1"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-400">VS</span>
            </div>
            <div>
              <label htmlFor="player2" className="block text-sm font-medium text-gray-700">
                Player 2
              </label>
              <select
                id="player2"
                name="player2"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Compare
            </button>
          </div>
        </form>
      </div>

      {/* H2H Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">How it works</h3>
        <p className="mt-1 text-sm text-blue-700">
          Select two players above and click Compare to see their head-to-head record,
          including wins, losses, average scores, and recent match history.
        </p>
      </div>
    </div>
  )
}