/**
 * GetActiveGames Use Case Tests
 * Feature: 005-top-active-games
 * Tests filtering and ordering of active games
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetActiveGames } from './GetActiveGames';
import type { GameRepository } from '@/server/domain/repositories/GameRepository';

describe('GetActiveGames', () => {
  let mockRepository: GameRepository;
  let useCase: GetActiveGames;

  beforeEach(() => {
    // Create mock repository with necessary methods
    mockRepository = {
      findMany: vi.fn(),
      count: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as GameRepository;

    useCase = new GetActiveGames(mockRepository);
  });

  describe('filtering by status', () => {
    it('should return only games with 出題中 status', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game-1',
          title: 'Active Game 1',
          status: '出題中',
          createdAt: new Date('2025-01-18T10:00:00Z'),
          playerLimit: 10,
          _count: { players: 5 },
        },
        {
          id: 'game-2',
          title: 'Active Game 2',
          status: '出題中',
          createdAt: new Date('2025-01-18T09:00:00Z'),
          playerLimit: null,
          _count: { players: 3 },
        },
      ];

      vi.mocked(mockRepository.findMany).mockResolvedValue(mockGames as any);
      vi.mocked(mockRepository.count).mockResolvedValue(2);

      // Act
      const result = await useCase.execute({ limit: 20 });

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        where: { status: '出題中' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
        include: {
          _count: { select: { players: true } },
        },
      });
      expect(result.games).toHaveLength(2);
      expect(result.games[0].title).toBe('Active Game 1');
    });

    it('should not return games with 準備中 or 締切 status', async () => {
      // Arrange
      vi.mocked(mockRepository.findMany).mockResolvedValue([]);
      vi.mocked(mockRepository.count).mockResolvedValue(0);

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: '出題中' },
        })
      );
      expect(result.games).toHaveLength(0);
    });
  });

  describe('ordering by creation date', () => {
    it('should order games by creation date descending (newest first)', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game-new',
          title: 'Newest Game',
          status: '出題中',
          createdAt: new Date('2025-01-18T12:00:00Z'),
          playerLimit: null,
          _count: { players: 2 },
        },
        {
          id: 'game-old',
          title: 'Older Game',
          status: '出題中',
          createdAt: new Date('2025-01-18T08:00:00Z'),
          playerLimit: 10,
          _count: { players: 5 },
        },
      ];

      vi.mocked(mockRepository.findMany).mockResolvedValue(mockGames as any);
      vi.mocked(mockRepository.count).mockResolvedValue(2);

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
      expect(result.games[0].id).toBe('game-new');
      expect(result.games[1].id).toBe('game-old');
    });
  });

  describe('pagination', () => {
    it('should support cursor-based pagination', async () => {
      // Arrange
      const mockGames = [{
        id: 'game-1',
        title: 'Game 1',
        status: '出題中',
        createdAt: new Date(),
        playerLimit: null,
        _count: { players: 0 },
      }];

      vi.mocked(mockRepository.findMany).mockResolvedValue(mockGames as any);
      vi.mocked(mockRepository.count).mockResolvedValue(50);

      // Act
      const result = await useCase.execute({ cursor: '20', limit: 20 });

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      );
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('40');
    });

    it('should indicate no more results when at end', async () => {
      // Arrange
      vi.mocked(mockRepository.findMany).mockResolvedValue([]);
      vi.mocked(mockRepository.count).mockResolvedValue(15);

      // Act
      const result = await useCase.execute({ cursor: '20', limit: 20 });

      // Assert
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('player count aggregation', () => {
    it('should include current player count for each game', async () => {
      // Arrange
      const mockGames = [{
        id: 'game-1',
        title: 'Game with Players',
        status: '出題中',
        createdAt: new Date(),
        playerLimit: 10,
        _count: { players: 7 },
      }];

      vi.mocked(mockRepository.findMany).mockResolvedValue(mockGames as any);
      vi.mocked(mockRepository.count).mockResolvedValue(1);

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result.games[0].playerCount).toBe(7);
      expect(result.games[0].playerLimit).toBe(10);
    });
  });
});
