// Create mocks before importing
const mockPlayerFindMany = jest.fn();

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), init);
    },
  },
}));

// Mock prisma
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    player: {
      findMany: (...args: unknown[]) => mockPlayerFindMany(...args),
    },
  },
}));

import { GET } from './route';

describe('Leaderboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return leaderboard with rankings', async () => {
      const mockPlayers = [
        { id: '1', name: 'John', email: 'john@example.com', rating: 1200, wins: 10, losses: 2, draws: 1 },
        { id: '2', name: 'Jane', email: 'jane@example.com', rating: 1100, wins: 8, losses: 4, draws: 0 },
      ];
      mockPlayerFindMany.mockResolvedValue(mockPlayers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({
        rank: 1,
        id: '1',
        name: 'John',
        email: 'john@example.com',
        rating: 1200,
        wins: 10,
        losses: 2,
        draws: 1,
        winRate: 83,
      });
      expect(data[1]).toEqual({
        rank: 2,
        id: '2',
        name: 'Jane',
        email: 'jane@example.com',
        rating: 1100,
        wins: 8,
        losses: 4,
        draws: 0,
        winRate: 67,
      });
    });

    it('should handle players with no matches', async () => {
      const mockPlayers = [
        { id: '1', name: 'New Player', email: 'new@example.com', rating: 1000, wins: 0, losses: 0, draws: 0 },
      ];
      mockPlayerFindMany.mockResolvedValue(mockPlayers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].winRate).toBe(0);
    });

    it('should return empty array when no players', async () => {
      mockPlayerFindMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should order players by rating descending', async () => {
      // The API returns players ordered by rating, so we mock the result in the expected order
      const mockPlayers = [
        { id: '2', name: 'High', email: 'high@example.com', rating: 1500, wins: 10, losses: 0, draws: 0 },
        { id: '1', name: 'Low', email: 'low@example.com', rating: 900, wins: 0, losses: 5, draws: 0 },
      ];
      mockPlayerFindMany.mockResolvedValue(mockPlayers);

      const response = await GET();
      const data = await response.json();

      expect(data[0].name).toBe('High');
      expect(data[1].name).toBe('Low');
    });

    it('should return error response on failure', async () => {
      mockPlayerFindMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch leaderboard' });
    });
  });
});