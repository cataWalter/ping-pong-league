import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { rating: 'desc' },
    })

    const leaderboard = players.map((player, index) => ({
      rank: index + 1,
      id: player.id,
      name: player.name,
      email: player.email,
      rating: player.rating,
      wins: player.wins,
      losses: player.losses,
      draws: player.draws,
      winRate: player.wins + player.losses > 0
        ? Math.round((player.wins / (player.wins + player.losses)) * 100)
        : 0,
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}