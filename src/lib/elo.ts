/**
 * Advanced ELO Rating System for Ping Pong League
 * Based on standard ELO with modifications for table tennis
 */

// ELO configuration
const K_FACTOR = 32 // Standard K-factor for rating changes
const INITIAL_RATING = 1000

interface RatingChange {
  playerId: string
  oldRating: number
  newRating: number
  change: number
}

/**
 * Calculate expected score based on ELO ratings
 */
function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))
}

/**
 * Calculate new ELO ratings after a match
 */
export function calculateEloRatings(
  player1Rating: number,
  player2Rating: number,
  player1Score: number,
  player2Score: number,
  kFactor: number = K_FACTOR
): { player1New: number; player2New: number } {
  const expected1 = expectedScore(player1Rating, player2Rating)
  const expected2 = expectedScore(player2Rating, player1Rating)

  // Determine actual score (1 = win, 0.5 = draw, 0 = loss)
  let actual1: number
  let actual2: number

  if (player1Score > player2Score) {
    actual1 = 1
    actual2 = 0
  } else if (player2Score > player1Score) {
    actual1 = 0
    actual2 = 1
  } else {
    actual1 = 0.5
    actual2 = 0.5
  }

  // Apply margin of victory multiplier
  const marginMultiplier = calculateMarginMultiplier(player1Score, player2Score)

  const player1New = player1Rating + kFactor * (actual1 - expected1) * marginMultiplier
  const player2New = player2Rating + kFactor * (actual2 - expected2) * marginMultiplier

  return { player1New: Math.round(player1New * 100) / 100, player2New: Math.round(player2New * 100) / 100 }
}

/**
 * Calculate margin of victory multiplier
 * Winning by a larger margin results in slightly more rating change
 */
function calculateMarginMultiplier(winnerScore: number, loserScore: number): number {
  const diff = Math.abs(winnerScore - loserScore)
  // Base multiplier with bonus for dominant wins
  // A shutout (e.g., 11-0) gives about 1.5x multiplier
  return 1 + Math.log(diff + 1) * 0.25
}

/**
 * Get rating change details for both players
 */
export function getRatingChanges(
  player1Id: string,
  player2Id: string,
  player1Rating: number,
  player2Rating: number,
  player1Score: number,
  player2Score: number
): RatingChange[] {
  const { player1New, player2New } = calculateEloRatings(player1Rating, player2Rating, player1Score, player2Score)

  return [
    {
      playerId: player1Id,
      oldRating: player1Rating,
      newRating: player1New,
      change: Math.round((player1New - player1Rating) * 100) / 100,
    },
    {
      playerId: player2Id,
      oldRating: player2Rating,
      newRating: player2New,
      change: Math.round((player2New - player2Rating) * 100) / 100,
    },
  ]
}

/**
 * Calculate win probability between two players
 */
export function getWinProbability(playerRating: number, opponentRating: number): number {
  return expectedScore(playerRating, opponentRating) * 100
}

/**
 * Calculate confidence intervals for ratings
 */
export function getRatingConfidence(rating: number, matchesPlayed: number): { low: number; high: number } {
  // More matches = higher confidence = narrower interval
  const uncertainty = 200 / Math.sqrt(matchesPlayed + 1)
  return {
    low: Math.round((rating - uncertainty) * 100) / 100,
    high: Math.round((rating + uncertainty) * 100) / 100,
  }
}

export { INITIAL_RATING, K_FACTOR }