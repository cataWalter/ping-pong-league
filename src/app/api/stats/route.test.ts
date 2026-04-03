// Create mocks before importing
const mockPlayerCount = jest.fn();
const mockMatchCount = jest.fn();
const mockMatchFindMany = jest.fn();
const mockPlayerFindFirst = jest.fn();

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
      count: (...args: unknown[]) => mockPlayerCount(...args),
      findFirst: (...args: unknown[]) => mockPlayerFindFirst(...args),
    },
    match: {
      count: (...args: unknown[]) => mockMatchCount(...args),
      findMany: (...args: unknown[]) => mockMatchFindMany(...args),
    },
  },
}));

import { GET } from './route';

describe('Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return statistics', async () => {
      mockPlayerCount.mockResolvedValue(10);
      mockMatchCount.mockResolvedValue(50);
      mockMatchFindMany.mockResolvedValue([
        { id: '1', player1Id: '1', player2Id: '2', player1Score: 11, player2Score: 5 },
      ]);
      mockPlayerFindFirst.mockResolvedValue({ name: 'Top Player', rating: 1500 });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        totalPlayers: 10,
        totalMatches: 50,
        recentMatches: 1,
        topPlayer: { name: 'Top Player', rating: 1500 },
      });
    });

    it('should return zero counts when no data', async () => {
      mockPlayerCount.mockResolvedValue(0);
      mockMatchCount.mockResolvedValue(0);
      mockMatchFindMany.mockResolvedValue([]);
      mockPlayerFindFirst.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        totalPlayers: 0,
        totalMatches: 0,
        recentMatches: 0,
        topPlayer: null,
      });
    });

    it('should count recent matches correctly', async () => {
      mockPlayerCount.mockResolvedValue(5);
      mockMatchCount.mockResolvedValue(20);
      mockMatchFindMany.mockResolvedValue([
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ]);
      mockPlayerFindFirst.mockResolvedValue({ name: 'Player', rating: 1200 });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recentMatches).toBe(3);
    });

    it('should round top player rating', async () => {
      mockPlayerCount.mockResolvedValue(5);
      mockMatchCount.mockResolvedValue(10);
      mockMatchFindMany.mockResolvedValue([]);
      mockPlayerFindFirst.mockResolvedValue({ name: 'Top Player', rating: 1234.567 });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.topPlayer).toEqual({ name: 'Top Player', rating: 1235 });
    });

    it('should return error response on failure', async () => {
      mockPlayerCount.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch statistics' });
    });
  });
});