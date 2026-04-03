import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getRatingChanges } from '@/lib/elo'
import { checkAchievements, type PlayerStats } from '@/lib/achievements'

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { playedAt: 'desc' },
      take: 50,
      include: {
        player1: true,
        player2: true,
      },
    })
    return NextResponse.json(matches)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || ''
    let data: {
      player1: string
      player2: string
      player1Score: number
      player2Score: number
      bestOf: number
      notes: string
    }

    if (contentType.includes('application/json')) {
      data = await request.json()
    } else {
      const formData = await request.formData()
      data = {
        player1: formData.get('player1') as string,
        player2: formData.get('player2') as string,
        player1Score: parseInt(formData.get('player1Score') as string),
        player2Score: parseInt(formData.get('player2Score') as string),
        bestOf: parseInt(formData.get('bestOf') as string) || 1,
        notes: formData.get('notes') as string,
      }
    }

    const { player1: player1Id, player2: player2Id, player1Score, player2Score, bestOf, notes } = data

    if (!player1Id || !player2Id || player1Id === player2Id) {
      return NextResponse.json(
        { error: 'Please select two different players' },
        { status: 400 }
      )
    }

    if (
      typeof player1Score !== 'number' ||
      typeof player2Score !== 'number' ||
      player1Score < 0 ||
      player2Score < 0
    ) {
      return NextResponse.json(
        { error: 'Please enter valid scores' },
        { status: 400 }
      )
    }

    // Get current player data
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
        { error: 'Players not found' },
        { status: 404 }
      )
    }

    // Calculate ELO changes
    const ratingChanges = getRatingChanges(
      player1Id,
      player2Id,
      player1.rating,
      player2.rating,
      player1Score,
      player2Score
    )

    // Determine winner
    let winnerId: string | null = null
    if (player1Score > player2Score) {
      winnerId = player1Id
    } else if (player2Score > player1Score) {
      winnerId = player2Id
    }

    // Create the match with rating tracking
    const match = await prisma.match.create({
      data: {
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        winnerId,
        bestOf,
        notes,
        player1RatingBefore: player1.rating,
        player2RatingBefore: player2.rating,
        player1RatingAfter: ratingChanges[0].newRating,
        player2RatingAfter: ratingChanges[1].newRating,
      },
    })

    // Update player stats and check achievements
    if (winnerId) {
      const winner = winnerId === player1Id ? player1 : player2
      const loser = winnerId === player1Id ? player2 : player1

      // Update winner
      const newWinnerStreak = winner.streak > 0 ? winner.streak + 1 : 1
      const newWinnerBestStreak = Math.max(winner.bestStreak, newWinnerStreak)

      await prisma.player.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          rating: ratingChanges.find((r) => r.playerId === winnerId)!.newRating,
          streak: newWinnerStreak,
          bestStreak: newWinnerBestStreak,
          totalPoints: { increment: player1Score },
          totalLostPoints: { increment: player2Score },
        },
      })

      // Update loser
      const newLoserStreak = loser.streak < 0 ? loser.streak - 1 : -1

      await prisma.player.update({
        where: { id: loser.id },
        data: {
          losses: { increment: 1 },
          rating: ratingChanges.find((r) => r.playerId === loser.id)!.newRating,
          streak: newLoserStreak,
          totalPoints: { increment: player2Score },
          totalLostPoints: { increment: player1Score },
        },
      })

      // Record rating history
      await prisma.ratingHistory.createMany({
        data: ratingChanges.map((rc) => ({
          playerId: rc.playerId,
          rating: rc.newRating,
          change: rc.change,
        })),
      })

      // Check achievements for winner
      const winnerStats: PlayerStats = {
        wins: winner.wins + 1,
        losses: winner.losses,
        draws: winner.draws,
        rating: ratingChanges.find((r) => r.playerId === winnerId)!.newRating,
        streak: newWinnerStreak,
        bestStreak: newWinnerBestStreak,
        totalMatches: winner.wins + winner.losses + winner.draws + 1,
        winRate: ((winner.wins + 1) / (winner.wins + winner.losses + winner.draws + 1)) * 100,
        totalPoints: winner.totalPoints + (winner === player1 ? player1Score : player2Score),
        averagePointsPerMatch: 0,
      }

      const winnerAchievements = checkAchievements(winnerStats, winner.achievements.map((a) => a.type))
      for (const achievement of winnerAchievements) {
        await prisma.achievement.create({
          data: {
            playerId: winnerId,
            type: achievement.type,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
          },
        })
      }

      // Check achievements for loser too
      const loserStats: PlayerStats = {
        wins: loser.wins,
        losses: loser.losses + 1,
        draws: loser.draws,
        rating: ratingChanges.find((r) => r.playerId === loser.id)!.newRating,
        streak: newLoserStreak,
        bestStreak: loser.bestStreak,
        totalMatches: loser.wins + loser.losses + loser.draws + 1,
        winRate: loser.wins / (loser.wins + loser.losses + loser.draws + 1) * 100,
        totalPoints: loser.totalPoints + (loser === player1 ? player1Score : player2Score),
        averagePointsPerMatch: 0,
      }

      const loserAchievements = checkAchievements(loserStats, loser.achievements.map((a) => a.type))
      for (const achievement of loserAchievements) {
        await prisma.achievement.create({
          data: {
            playerId: loser.id,
            type: achievement.type,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
          },
        })
      }
    } else {
      // Draw
      await prisma.player.update({
        where: { id: player1Id },
        data: {
          draws: { increment: 1 },
          rating: ratingChanges[0].newRating,
          totalPoints: { increment: player1Score },
          totalLostPoints: { increment: player2Score },
        },
      })
      await prisma.player.update({
        where: { id: player2Id },
        data: {
          draws: { increment: 1 },
          rating: ratingChanges[1].newRating,
          totalPoints: { increment: player2Score },
          totalLostPoints: { increment: player1Score },
        },
      })

      // Record rating history for draw
      await prisma.ratingHistory.createMany({
        data: ratingChanges.map((rc) => ({
          playerId: rc.playerId,
          rating: rc.newRating,
          change: rc.change,
        })),
      })
    }

    return NextResponse.json(match, { status: 201 })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
}