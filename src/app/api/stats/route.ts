import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const [totalPlayers, totalMatches, recentMatches] = await Promise.all([
      prisma.player.count(),
      prisma.match.count(),
      prisma.match.findMany({
        take: 10,
        orderBy: { playedAt: 'desc' },
      }),
    ])

    const topPlayer = await prisma.player.findFirst({
      orderBy: { rating: 'desc' },
      select: { name: true, rating: true },
    })

    return NextResponse.json({
      totalPlayers,
      totalMatches,
      recentMatches: recentMatches.length,
      topPlayer: topPlayer
        ? { name: topPlayer.name, rating: Math.round(topPlayer.rating) }
        : null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}