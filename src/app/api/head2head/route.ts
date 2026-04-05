import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const player1Id = searchParams.get('player1')
    const player2Id = searchParams.get('player2')

    if (!player1Id || !player2Id) {
      return NextResponse.json(
        { error: 'Both player1 and player2 parameters are required' },
        { status: 400 }
      )
    }

    const player1 = await prisma.player.findUnique({
      where: { id: player1Id },
      include: { achievements: true },
    })

    const player2 = await prisma.player.findUnique({
      where: { id: player2Id },
      include: { achievements: true },
    })

    if (!player1 || !player2) {
      return NextResponse.json(
        { error: 'One or both players not found' },
        { status: 404 }
      )
    }

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
    let totalScore1 = 0
    let totalScore2 = 0

    matches.forEach((match) => {
      if (match.winnerId === player1Id) {
        player1Wins++
      } else if (match.winnerId === player2Id) {
        player2Wins++
      } else {
        draws++
      }

      if (match.player1Id === player1Id) {
        totalScore1 += match.player1Score
        totalScore2 += match.player2Score
      } else {
        totalScore1 += match.player2Score
        totalScore2 += match.player1Score
      }
    })

    const totalMatches = matches.length
    const player1WinRate = totalMatches > 0 ? Math.round((player1Wins / totalMatches) * 100) : 0
    const player2WinRate = totalMatches > 0 ? Math.round((player2Wins / totalMatches) * 100) : 0
    const averageScore1 = totalMatches > 0 ? totalScore1 / totalMatches : 0
    const averageScore2 = totalMatches > 0 ? totalScore2 / totalMatches : 0

    const result = {
      player1,
      player2,
      matches,
      player1Wins,
      player2Wins,
      draws,
      totalMatches,
      player1WinRate,
      player2WinRate,
      averageScore1,
      averageScore2,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Head-to-head API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch head-to-head data' },
      { status: 500 }
    )
  }
}