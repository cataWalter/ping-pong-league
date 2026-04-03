// Create mocks before importing
const mockPlayerFindMany = jest.fn();
const mockPlayerCreate = jest.fn();

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
      create: (...args: unknown[]) => mockPlayerCreate(...args),
    },
  },
}));

import { GET, POST } from './route';

describe('Players API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return players ordered by rating', async () => {
      const mockPlayers = [
        { id: '1', name: 'John', email: 'john@example.com', rating: 1200 },
        { id: '2', name: 'Jane', email: 'jane@example.com', rating: 1100 },
      ];
      mockPlayerFindMany.mockResolvedValue(mockPlayers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPlayers);
      expect(mockPlayerFindMany).toHaveBeenCalledWith({
        orderBy: { rating: 'desc' },
      });
    });

    it('should return empty array when no players', async () => {
      mockPlayerFindMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return error response on failure', async () => {
      mockPlayerFindMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch players' });
    });
  });

  describe('POST', () => {
    const createRequest = (body: object, contentType = 'application/json') => {
      return {
        json: async () => body,
        headers: {
          get: () => contentType,
        },
      } as unknown as Request;
    };

    it('should create a new player', async () => {
      const mockPlayer = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      };
      mockPlayerCreate.mockResolvedValue(mockPlayer);

      const request = createRequest({ name: 'John Doe', email: 'john@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockPlayer);
      expect(mockPlayerCreate).toHaveBeenCalledWith({
        data: { name: 'John Doe', email: 'john@example.com' },
      });
    });

    it('should return error when name is missing', async () => {
      const request = createRequest({ email: 'john@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Name and email are required' });
    });

    it('should return error when email is missing', async () => {
      const request = createRequest({ name: 'John Doe' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Name and email are required' });
    });

    it('should return error when both name and email are missing', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Name and email are required' });
    });

    it('should return error response on failure', async () => {
      mockPlayerCreate.mockRejectedValue(new Error('Database error'));

      const request = createRequest({ name: 'John Doe', email: 'john@example.com' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create player' });
    });
  });
});