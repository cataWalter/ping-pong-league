// Create mocks before importing
const mockMatchFindMany = jest.fn();
const mockMatchCreate = jest.fn();
const mockPlayerFindUnique = jest.fn();
const mockPlayerUpdate = jest.fn();
const mockRatingHistoryCreateMany = jest.fn();
const mockAchievementCreate = jest.fn();

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
    match: {
      findMany: (...args: unknown[]) => mockMatchFindMany(...args),
      create: (...args: unknown[]) => mockMatchCreate(...args),
    },
    player: {
      findUnique: (...args: unknown[]) => mockPlayerFindUnique(...args),
      update: (...args: unknown[]) => mockPlayerUpdate(...args),
    },
    ratingHistory: {
      createMany: (...args: unknown[]) => mockRatingHistoryCreateMany(...args),
    },
    achievement: {
      create: (...args: unknown[]) => mockAchievementCreate(...args),
    },
  },
}));

import { GET, POST } from './route';

describe('Matches API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return matches ordered by date', async () => {
      const mockMatches = [
        { id: '1', player1Id: '1', player2Id: '2', player1Score: 11, player2Score: 5, playedAt: new Date('2024-01-15') },
        { id: '2', player1Id: '3', player2Id: '4', player1Score: 9, player2Score: 11, playedAt: new Date('2024-01-14') },
      ];
      mockMatchFindMany.mockResolvedValue(mockMatches);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe('1');
      expect(data[1].id).toBe('2');
      expect(mockMatchFindMany).toHaveBeenCalledWith({
        orderBy: { playedAt: 'desc' },
        take: 50,
        include: { player1: true, player2: true },
      });
    });

    it('should return empty array when no matches', async () => {
      mockMatchFindMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return error response on failure', async () => {
      mockMatchFindMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch matches' });
    });
  });

  describe('POST', () => {
    const createPlayer = (overrides = {}) => ({
      id: '1',
      name: 'Player 1',
      email: 'p1@example.com',
      rating: 1000,
      wins: 5,
      losses: 3,
      draws: 1,
      streak: 2,
      bestStreak: 4,
      totalPoints: 100,
      totalLostPoints: 80,
      achievements: [],
      ...overrides,
    });

    const createRequest = (body: object, contentType = 'application/json') => {
      return {
        json: async () => body,
        headers: {
          get: () => contentType,
        },
      } as unknown as Request;
    };

    it('should create a match with JSON body', async () => {
      const player1 = createPlayer({ id: '1', rating: 1000 });
      const player2 = createPlayer({ id: '2', rating: 1000 });
      mockPlayerFindUnique
        .mockResolvedValueOnce(player1)
        .mockResolvedValueOnce(player2);

      const mockMatch = {
        id: 'match-1',
        player1Id: '1',
        player2Id: '2',
        player1Score: 11,
        player2Score: 5,
        winnerId: '1',
      };
      mockMatchCreate.mockResolvedValue(mockMatch);

      const request = createRequest({
        player1: '1',
        player2: '2',
        player1Score: 11,
        player2Score: 5,
        bestOf: 1,
        notes: 'Test match',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockMatch);
    });

    it('should create a match with FormData', async () => {
      const player1 = createPlayer({ id: '1', rating: 1000 });
      const player2 = createPlayer({ id: '2', rating: 1000 });
      mockPlayerFindUnique
        .mockResolvedValueOnce(player1)
        .mockResolvedValueOnce(player2);

      const mockMatch = { id: 'match-1' };
      mockMatchCreate.mockResolvedValue(mockMatch);

      const formData = new FormData();
      formData.append('player1', '1');
      formData.append('player2', '2');
      formData.append('player1Score', '11');
      formData.append('player2Score', '5');
      formData.append('bestOf', '1');
      formData.append('notes', 'Form data match');

      const request = {
        json: async () => ({}),
        formData: async () => formData,
        headers: {
          get: () => 'application/x-www-form-urlencoded',
        },
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
    });

    it('should return error when same player is selected twice', async () => {
      const request = createRequest({
        player1: '1',
        player2: '1',
        player1Score: 11,
        player2Score: 5,
        bestOf: 1,
        notes: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Please select two different players' });
    });

    it('should return error when player1 is missing', async () => {
      const request = createRequest({
        player2: '2',
        player1Score: 11,
        player2Score: 5,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Please select two different players' });
    });

    it('should return error when scores are invalid', async () => {
      const request = createRequest({
        player1: '1',
        player2: '2',
        player1Score: -1,
        player2Score: 5,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Please enter valid scores' });
    });

    it('should return error when player not found', async () => {
      mockPlayerFindUnique.mockResolvedValueOnce(null);

      const request = createRequest({
        player1: '1',
        player2: '2',
        player1Score: 11,
        player2Score: 5,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Players not found' });
    });

    it('should handle a draw', async () => {
      const player1 = createPlayer({ id: '1', rating: 1000 });
      const player2 = createPlayer({ id: '2', rating: 1000 });
      mockPlayerFindUnique
        .mockResolvedValueOnce(player1)
        .mockResolvedValueOnce(player2);

      const mockMatch = { id: 'match-1', winnerId: null };
      mockMatchCreate.mockResolvedValue(mockMatch);

      const request = createRequest({
        player1: '1',
        player2: '2',
        player1Score: 11,
        player2Score: 11,
        bestOf: 1,
        notes: 'Draw match',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
    });

    it('should handle player2 winning', async () => {
      const player1 = createPlayer({ id: '1', rating: 1000 });
      const player2 = createPlayer({ id: '2', rating: 1000 });
      mockPlayerFindUnique
        .mockResolvedValueOnce(player1)
        .mockResolvedValueOnce(player2);

      const mockMatch = { id: 'match-1', winnerId: '2' };
      mockMatchCreate.mockResolvedValue(mockMatch);

      const request = createRequest({
        player1: '1',
        player2: '2',
        player1Score: 5,
        player2Score: 11,
        bestOf: 1,
        notes: 'Player 2 wins',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.winnerId).toBe('2');
    });

    it('should return error response on failure', async () => {
      mockPlayerFindUnique.mockRejectedValue(new Error('Database error'));

      const request = createRequest({
        player1: '1',
        player2: '2',
        player1Score: 11,
        player2Score: 5,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create match' });
    });
  });
});