import prisma from '@/lib/db'
import { calculateWinRate } from '@/lib/utils'
import Link from 'next/link'
import { Avatar, Badge, Button, Card } from '@/components'
import { revalidatePath } from 'next/cache'

async function getPlayers() {
  return prisma.player.findMany({
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
}

async function registerPlayer(formData: FormData) {
  'use server'

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const department = formData.get('department') as string

  if (!name || !email) {
    throw new Error('Name and email are required')
  }

  await prisma.player.create({
    data: {
      name,
      email,
      department: department || null,
    },
  })

  revalidatePath('/players')
}

function getRatingBadge(rating: number) {
  if (rating >= 1400) return { label: 'Grand Master', color: 'bg-purple-100 text-purple-800' }
  if (rating >= 1300) return { label: 'Master', color: 'bg-yellow-100 text-yellow-800' }
  if (rating >= 1200) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' }
  if (rating >= 1100) return { label: 'Skilled', color: 'bg-green-100 text-green-800' }
  if (rating >= 1000) return { label: 'Intermediate', color: 'bg-gray-100 text-gray-800' }
  return { label: 'Beginner', color: 'bg-gray-100 text-gray-800' }
}

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Players</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All registered players in the league ({players.length} total)
          </p>
        </div>
        <RegisterPlayerDialog />
      </div>

      {players.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No players yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to join the league!</p>
          <RegisterPlayerDialog />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, index) => {
            const totalMatches = player._count.matchesAsPlayer1 + player._count.matchesAsPlayer2
            const winRate = calculateWinRate(player.wins, player.losses)
            const ratingBadge = getRatingBadge(player.rating)

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="block group"
              >
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar
                      name={player.name}
                      size="lg"
                      showRank={index < 3}
                      rank={index + 1}
                    />
                    <Badge variant="default" size="sm" className={ratingBadge.color}>
                      {ratingBadge.label}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {player.name}
                  </h3>
                  {player.department && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {player.department}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Rating</p>
                      <p className="text-lg font-bold text-primary-600">
                        {Math.round(player.rating)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Record</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {player.wins}-{player.losses}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Win %</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {winRate}%
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RegisterPlayerDialog() {
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none">
          <Button icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }>
            Add Player
          </Button>
        </summary>
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 z-50 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Register New Player
          </h3>
          <form action={registerPlayer} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Engineering"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                Register
              </Button>
            </div>
          </form>
        </div>
      </details>
    </div>
  )
}