import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample players
  const players = [
    { name: 'Alice Johnson', email: 'alice@company.com', rating: 1200 },
    { name: 'Bob Smith', email: 'bob@company.com', rating: 1150 },
    { name: 'Charlie Brown', email: 'charlie@company.com', rating: 1100 },
    { name: 'Diana Prince', email: 'diana@company.com', rating: 1050 },
    { name: 'Eve Wilson', email: 'eve@company.com', rating: 1000 },
  ]

  for (const playerData of players) {
    await prisma.player.upsert({
      where: { email: playerData.email },
      update: {},
      create: playerData,
    })
  }

  // Get all players
  const allPlayers = await prisma.player.findMany()

  // Create some sample matches
  if (allPlayers.length >= 2) {
    const matches = [
      {
        player1Id: allPlayers[0].id,
        player2Id: allPlayers[1].id,
        player1Score: 11,
        player2Score: 7,
        winnerId: allPlayers[0].id,
      },
      {
        player1Id: allPlayers[2].id,
        player2Id: allPlayers[3].id,
        player1Score: 9,
        player2Score: 11,
        winnerId: allPlayers[3].id,
      },
      {
        player1Id: allPlayers[0].id,
        player2Id: allPlayers[4].id,
        player1Score: 11,
        player2Score: 5,
        winnerId: allPlayers[0].id,
      },
      {
        player1Id: allPlayers[1].id,
        player2Id: allPlayers[2].id,
        player1Score: 11,
        player2Score: 9,
        winnerId: allPlayers[1].id,
      },
      {
        player1Id: allPlayers[3].id,
        player2Id: allPlayers[4].id,
        player1Score: 8,
        player2Score: 11,
        winnerId: allPlayers[4].id,
      },
    ]

    for (const matchData of matches) {
      await prisma.match.create({ data: matchData })
    }

    // Update player stats
    await prisma.player.update({
      where: { id: allPlayers[0].id },
      data: { wins: 2, losses: 0 },
    })
    await prisma.player.update({
      where: { id: allPlayers[1].id },
      data: { wins: 1, losses: 1 },
    })
    await prisma.player.update({
      where: { id: allPlayers[2].id },
      data: { wins: 0, losses: 2 },
    })
    await prisma.player.update({
      where: { id: allPlayers[3].id },
      data: { wins: 1, losses: 1 },
    })
    await prisma.player.update({
      where: { id: allPlayers[4].id },
      data: { wins: 1, losses: 1 },
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })