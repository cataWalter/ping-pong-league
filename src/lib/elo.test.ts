import {
  calculateEloRatings,
  getRatingChanges,
  getWinProbability,
  getRatingConfidence,
  INITIAL_RATING,
  K_FACTOR,
} from './elo';

describe('ELO Rating System', () => {
  describe('constants', () => {
    it('should have correct INITIAL_RATING', () => {
      expect(INITIAL_RATING).toBe(1000);
    });

    it('should have correct K_FACTOR', () => {
      expect(K_FACTOR).toBe(32);
    });
  });

  describe('calculateEloRatings', () => {
    it('should calculate ratings when player1 wins with equal ratings', () => {
      const result = calculateEloRatings(1000, 1000, 11, 5);
      expect(result.player1New).toBeGreaterThan(1000);
      expect(result.player2New).toBeLessThan(1000);
    });

    it('should calculate ratings when player2 wins with equal ratings', () => {
      const result = calculateEloRatings(1000, 1000, 5, 11);
      expect(result.player1New).toBeLessThan(1000);
      expect(result.player2New).toBeGreaterThan(1000);
    });

    it('should handle a draw', () => {
      const result = calculateEloRatings(1000, 1000, 11, 11);
      // With draw, higher rated player loses points, lower rated gains
      // But with equal ratings, both stay roughly same (small change due to margin)
      expect(result.player1New).toBe(result.player2New);
    });

    it('should give more rating change when higher rated player wins by large margin', () => {
      const result = calculateEloRatings(1200, 800, 11, 0);
      // Higher rated player expected to win, so less rating gain
      expect(result.player1New).toBeGreaterThan(1200);
      expect(result.player1New - 1200).toBeLessThan(16); // Less than half K_FACTOR
    });

    it('should give more rating change when lower rated player wins (upset)', () => {
      const result = calculateEloRatings(800, 1200, 11, 0);
      // Lower rated player wins big upset
      expect(result.player1New).toBeGreaterThan(800);
      expect(result.player1New - 800).toBeGreaterThan(20); // Significant gain
    });

    it('should use custom K-factor when provided', () => {
      const result = calculateEloRatings(1000, 1000, 11, 5, 16);
      const resultDefault = calculateEloRatings(1000, 1000, 11, 5, 32);
      const changeCustom = Math.abs(result.player1New - 1000);
      const changeDefault = Math.abs(resultDefault.player1New - 1000);
      expect(changeCustom).toBeLessThan(changeDefault);
    });

    it('should round ratings to 2 decimal places', () => {
      const result = calculateEloRatings(1000, 1000, 11, 7);
      expect(result.player1New).toBe(Math.round(result.player1New * 100) / 100);
      expect(result.player2New).toBe(Math.round(result.player2New * 100) / 100);
    });
  });

  describe('getRatingChanges', () => {
    it('should return rating changes for both players', () => {
      const changes = getRatingChanges('player1', 'player2', 1000, 1000, 11, 5);
      expect(changes).toHaveLength(2);
      expect(changes[0].playerId).toBe('player1');
      expect(changes[1].playerId).toBe('player2');
    });

    it('should include old and new ratings', () => {
      const changes = getRatingChanges('player1', 'player2', 1000, 1000, 11, 5);
      expect(changes[0].oldRating).toBe(1000);
      expect(changes[0].newRating).toBeGreaterThan(1000);
      expect(changes[0].change).toBeGreaterThan(0);
    });

    it('should calculate correct change value', () => {
      const changes = getRatingChanges('player1', 'player2', 1000, 1000, 11, 5);
      expect(changes[0].change).toBe(Math.round((changes[0].newRating - changes[0].oldRating) * 100) / 100);
    });
  });

  describe('getWinProbability', () => {
    it('should return 50% for equal ratings', () => {
      const prob = getWinProbability(1000, 1000);
      expect(prob).toBe(50);
    });

    it('should return higher probability for higher rated player', () => {
      const prob = getWinProbability(1200, 800);
      expect(prob).toBeGreaterThan(50);
      expect(prob).toBeCloseTo(90.9, 0);
    });

    it('should return lower probability for lower rated player', () => {
      const prob = getWinProbability(800, 1200);
      expect(prob).toBeLessThan(50);
      expect(prob).toBeCloseTo(9.1, 0);
    });

    it('should return probability as percentage', () => {
      const prob = getWinProbability(1000, 1000);
      expect(prob).toBe(50);
    });
  });

  describe('getRatingConfidence', () => {
    it('should return wider interval for fewer matches', () => {
      const confidence0 = getRatingConfidence(1000, 0);
      const confidence5 = getRatingConfidence(1000, 5);
      const interval0 = confidence0.high - confidence0.low;
      const interval5 = confidence5.high - confidence5.low;
      expect(interval0).toBeGreaterThan(interval5);
    });

    it('should return narrower interval for more matches', () => {
      const confidence10 = getRatingConfidence(1000, 10);
      const confidence50 = getRatingConfidence(1000, 50);
      const interval10 = confidence10.high - confidence10.low;
      const interval50 = confidence50.high - confidence50.low;
      expect(interval10).toBeGreaterThan(interval50);
    });

    it('should center around the rating', () => {
      const confidence = getRatingConfidence(1200, 5);
      const center = (confidence.high + confidence.low) / 2;
      expect(center).toBeCloseTo(1200, 0);
    });

    it('should return low and high values', () => {
      const confidence = getRatingConfidence(1000, 1);
      expect(confidence.low).toBeLessThan(1000);
      expect(confidence.high).toBeGreaterThan(1000);
    });
  });
});