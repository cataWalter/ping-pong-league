import { cn, formatDate, formatDateTime, calculateWinRate } from './utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle falsy values', () => {
      const result = cn('class1', false, undefined, null, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle objects', () => {
      const result = cn('base', { active: true, disabled: false });
      expect(result).toBe('base active');
    });

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toBe('class1 class2');
    });

    it('should return empty string for no input', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format date string', () => {
      const result = formatDate('2024-06-25');
      expect(result).toBe('Jun 25, 2024');
    });

    it('should format date with different months', () => {
      expect(formatDate('2024-03-01')).toBe('Mar 1, 2024');
      expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object with time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('Jan 15, 2024');
      expect(result).toContain('2:30');
    });

    it('should format date string with time', () => {
      const result = formatDateTime('2024-06-25T09:15:00');
      expect(result).toContain('Jun 25, 2024');
      expect(result).toContain('9:15');
    });
  });

  describe('calculateWinRate', () => {
    it('should calculate win rate correctly', () => {
      expect(calculateWinRate(5, 5)).toBe(50);
      expect(calculateWinRate(3, 1)).toBe(75);
      expect(calculateWinRate(1, 3)).toBe(25);
    });

    it('should return 0 for no matches', () => {
      expect(calculateWinRate(0, 0)).toBe(0);
    });

    it('should return 100 for all wins', () => {
      expect(calculateWinRate(10, 0)).toBe(100);
    });

    it('should return 0 for all losses', () => {
      expect(calculateWinRate(0, 10)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateWinRate(1, 2)).toBe(33);
      expect(calculateWinRate(2, 1)).toBe(67);
    });
  });
});