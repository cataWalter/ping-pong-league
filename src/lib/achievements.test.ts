import {
  checkAchievements,
  getAchievementByType,
  achievementDefinitions,
  type PlayerStats,
  type AchievementDefinition,
} from './achievements';

describe('Achievements', () => {
  const createStats = (overrides: Partial<PlayerStats> = {}): PlayerStats => ({
    wins: 0,
    losses: 0,
    draws: 0,
    rating: 1000,
    streak: 0,
    bestStreak: 0,
    totalMatches: 0,
    winRate: 0,
    totalPoints: 0,
    averagePointsPerMatch: 0,
    ...overrides,
  });

  describe('achievementDefinitions', () => {
    it('should have all expected achievements', () => {
      expect(achievementDefinitions.length).toBeGreaterThan(0);
    });

    it('should have unique types', () => {
      const types = achievementDefinitions.map((a) => a.type);
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });

    it('should have required properties for each achievement', () => {
      achievementDefinitions.forEach((achievement) => {
        expect(achievement).toHaveProperty('type');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('check');
        expect(typeof achievement.check).toBe('function');
      });
    });
  });

  describe('checkAchievements', () => {
    it('should return empty array when no achievements earned', () => {
      const stats = createStats();
      const result = checkAchievements(stats, []);
      expect(result).toEqual([]);
    });

    it('should return first_win achievement when player has 1 win', () => {
      const stats = createStats({ wins: 1 });
      const result = checkAchievements(stats, []);
      expect(result.some((a) => a.type === 'first_win')).toBe(true);
    });

    it('should not return first_win if already earned', () => {
      const stats = createStats({ wins: 5 });
      const result = checkAchievements(stats, ['first_win']);
      expect(result.some((a) => a.type === 'first_win')).toBe(false);
    });

    it('should return wins achievements at correct thresholds', () => {
      expect(checkAchievements(createStats({ wins: 4 }), []).some((a) => a.type === 'wins_5')).toBe(false);
      expect(checkAchievements(createStats({ wins: 5 }), []).some((a) => a.type === 'wins_5')).toBe(true);
      expect(checkAchievements(createStats({ wins: 10 }), []).some((a) => a.type === 'wins_10')).toBe(true);
      expect(checkAchievements(createStats({ wins: 25 }), []).some((a) => a.type === 'wins_25')).toBe(true);
      expect(checkAchievements(createStats({ wins: 50 }), []).some((a) => a.type === 'wins_50')).toBe(true);
    });

    it('should return streak achievements at correct thresholds', () => {
      expect(checkAchievements(createStats({ bestStreak: 2 }), []).some((a) => a.type === 'streak_3')).toBe(false);
      expect(checkAchievements(createStats({ bestStreak: 3 }), []).some((a) => a.type === 'streak_3')).toBe(true);
      expect(checkAchievements(createStats({ bestStreak: 5 }), []).some((a) => a.type === 'streak_5')).toBe(true);
      expect(checkAchievements(createStats({ bestStreak: 10 }), []).some((a) => a.type === 'streak_10')).toBe(true);
    });

    it('should return rating achievements at correct thresholds', () => {
      expect(checkAchievements(createStats({ rating: 1099 }), []).some((a) => a.type === 'rating_1100')).toBe(false);
      expect(checkAchievements(createStats({ rating: 1100 }), []).some((a) => a.type === 'rating_1100')).toBe(true);
      expect(checkAchievements(createStats({ rating: 1200 }), []).some((a) => a.type === 'rating_1200')).toBe(true);
      expect(checkAchievements(createStats({ rating: 1300 }), []).some((a) => a.type === 'rating_1300')).toBe(true);
      expect(checkAchievements(createStats({ rating: 1400 }), []).some((a) => a.type === 'rating_1400')).toBe(true);
    });

    it('should return matches achievements at correct thresholds', () => {
      expect(checkAchievements(createStats({ totalMatches: 9 }), []).some((a) => a.type === 'matches_10')).toBe(false);
      expect(checkAchievements(createStats({ totalMatches: 10 }), []).some((a) => a.type === 'matches_10')).toBe(true);
      expect(checkAchievements(createStats({ totalMatches: 50 }), []).some((a) => a.type === 'matches_50')).toBe(true);
      expect(checkAchievements(createStats({ totalMatches: 100 }), []).some((a) => a.type === 'matches_100')).toBe(true);
    });

    it('should return win_rate_70 when conditions met', () => {
      expect(checkAchievements(createStats({ totalMatches: 9, winRate: 70 }), []).some((a) => a.type === 'win_rate_70')).toBe(false);
      expect(checkAchievements(createStats({ totalMatches: 10, winRate: 69 }), []).some((a) => a.type === 'win_rate_70')).toBe(false);
      expect(checkAchievements(createStats({ totalMatches: 10, winRate: 70 }), []).some((a) => a.type === 'win_rate_70')).toBe(true);
    });

    it('should return win_rate_80 when conditions met', () => {
      expect(checkAchievements(createStats({ totalMatches: 10, winRate: 79 }), []).some((a) => a.type === 'win_rate_80')).toBe(false);
      expect(checkAchievements(createStats({ totalMatches: 10, winRate: 80 }), []).some((a) => a.type === 'win_rate_80')).toBe(true);
    });

    it('should never return comeback_king achievement', () => {
      const result = checkAchievements(createStats(), []);
      expect(result.some((a) => a.type === 'comeback_king')).toBe(false);
    });

    it('should return multiple achievements when multiple conditions met', () => {
      const stats = createStats({ wins: 10, bestStreak: 5, rating: 1200, totalMatches: 50, winRate: 80 });
      const result = checkAchievements(stats, []);
      expect(result.length).toBeGreaterThan(1);
    });

    it('should filter out already earned achievements', () => {
      const stats = createStats({ wins: 10, bestStreak: 5 });
      const result = checkAchievements(stats, ['wins_5', 'streak_3']);
      expect(result.some((a) => a.type === 'wins_5')).toBe(false);
      expect(result.some((a) => a.type === 'streak_3')).toBe(false);
      expect(result.some((a) => a.type === 'wins_10')).toBe(true);
      expect(result.some((a) => a.type === 'streak_5')).toBe(true);
    });
  });

  describe('getAchievementByType', () => {
    it('should return achievement by type', () => {
      const achievement = getAchievementByType('first_win');
      expect(achievement).toBeDefined();
      expect(achievement?.type).toBe('first_win');
      expect(achievement?.name).toBe('First Blood');
    });

    it('should return undefined for non-existent type', () => {
      const achievement = getAchievementByType('non_existent');
      expect(achievement).toBeUndefined();
    });

    it('should return correct achievement for each type', () => {
      achievementDefinitions.forEach((def) => {
        const achievement = getAchievementByType(def.type);
        expect(achievement).toBeDefined();
        expect(achievement?.name).toBe(def.name);
      });
    });
  });
});