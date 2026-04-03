/**
 * Achievement System for Ping Pong League
 * Tracks and awards achievements based on player performance
 */

export interface AchievementDefinition {
  type: string
  name: string
  description: string
  icon: string
  check: (stats: PlayerStats) => boolean
}

export interface PlayerStats {
  wins: number
  losses: number
  draws: number
  rating: number
  streak: number
  bestStreak: number
  totalMatches: number
  winRate: number
  totalPoints: number
  averagePointsPerMatch: number
}

/**
 * All available achievements in the system
 */
export const achievementDefinitions: AchievementDefinition[] = [
  {
    type: 'first_win',
    name: 'First Blood',
    description: 'Win your first match',
    icon: '🏆',
    check: (stats) => stats.wins >= 1,
  },
  {
    type: 'wins_5',
    name: 'Rising Star',
    description: 'Win 5 matches',
    icon: '⭐',
    check: (stats) => stats.wins >= 5,
  },
  {
    type: 'wins_10',
    name: 'Challenger',
    description: 'Win 10 matches',
    icon: '🎯',
    check: (stats) => stats.wins >= 10,
  },
  {
    type: 'wins_25',
    name: 'Veteran',
    description: 'Win 25 matches',
    icon: '🎖️',
    check: (stats) => stats.wins >= 25,
  },
  {
    type: 'wins_50',
    name: 'Legend',
    description: 'Win 50 matches',
    icon: '👑',
    check: (stats) => stats.wins >= 50,
  },
  {
    type: 'streak_3',
    name: 'On Fire',
    description: 'Win 3 matches in a row',
    icon: '🔥',
    check: (stats) => stats.bestStreak >= 3,
  },
  {
    type: 'streak_5',
    name: 'Unstoppable',
    description: 'Win 5 matches in a row',
    icon: '💪',
    check: (stats) => stats.bestStreak >= 5,
  },
  {
    type: 'streak_10',
    name: 'Dominant Force',
    description: 'Win 10 matches in a row',
    icon: '🌟',
    check: (stats) => stats.bestStreak >= 10,
  },
  {
    type: 'rating_1100',
    name: 'Skilled Player',
    description: 'Reach a rating of 1100',
    icon: '📈',
    check: (stats) => stats.rating >= 1100,
  },
  {
    type: 'rating_1200',
    name: 'Expert',
    description: 'Reach a rating of 1200',
    icon: '🎓',
    check: (stats) => stats.rating >= 1200,
  },
  {
    type: 'rating_1300',
    name: 'Master',
    description: 'Reach a rating of 1300',
    icon: '🥇',
    check: (stats) => stats.rating >= 1300,
  },
  {
    type: 'rating_1400',
    name: 'Grand Master',
    description: 'Reach a rating of 1400',
    icon: '🏅',
    check: (stats) => stats.rating >= 1400,
  },
  {
    type: 'matches_10',
    name: 'Active Player',
    description: 'Play 10 matches',
    icon: '🏓',
    check: (stats) => stats.totalMatches >= 10,
  },
  {
    type: 'matches_50',
    name: 'Dedicated',
    description: 'Play 50 matches',
    icon: '💯',
    check: (stats) => stats.totalMatches >= 50,
  },
  {
    type: 'matches_100',
    name: 'Century',
    description: 'Play 100 matches',
    icon: '💎',
    check: (stats) => stats.totalMatches >= 100,
  },
  {
    type: 'win_rate_70',
    name: 'Consistent Winner',
    description: 'Maintain a 70% win rate (min 10 matches)',
    icon: '🎯',
    check: (stats) => stats.totalMatches >= 10 && stats.winRate >= 70,
  },
  {
    type: 'win_rate_80',
    name: 'Elite Player',
    description: 'Maintain an 80% win rate (min 10 matches)',
    icon: '🏆',
    check: (stats) => stats.totalMatches >= 10 && stats.winRate >= 80,
  },
  {
    type: 'comeback_king',
    name: 'Comeback King',
    description: 'Win a match after being behind',
    icon: '🔄',
    check: () => false, // Special achievement, checked during match
  },
]

/**
 * Check which achievements a player has earned
 */
export function checkAchievements(stats: PlayerStats, existingAchievementTypes: string[]): AchievementDefinition[] {
  const newAchievements: AchievementDefinition[] = []

  for (const achievement of achievementDefinitions) {
    if (!existingAchievementTypes.includes(achievement.type) && achievement.check(stats)) {
      newAchievements.push(achievement)
    }
  }

  return newAchievements
}

/**
 * Get achievement by type
 */
export function getAchievementByType(type: string): AchievementDefinition | undefined {
  return achievementDefinitions.find((a) => a.type === type)
}