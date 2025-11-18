/**
 * GetActiveGames Use Case
 * Feature: 005-top-active-games
 *
 * Fetches active games (出題中 status) for display on TOP page
 * Ordered by creation date (newest first) with pagination support
 */

import type { GameRepository } from '@/server/domain/repositories/GameRepository';
import type { ActiveGameListItem } from '@/types/game';
import { formatRelativeTime } from '@/lib/date-utils';

export interface GetActiveGamesParams {
  cursor?: string;
  limit?: number;
}

export interface GetActiveGamesResult {
  games: ActiveGameListItem[];
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
}

export class GetActiveGames {
  constructor(private gameRepository: GameRepository) {}

  async execute(params: GetActiveGamesParams = {}): Promise<GetActiveGamesResult> {
    const limit = params.limit || 20;
    const skip = params.cursor ? parseInt(params.cursor, 10) : 0;

    // Fetch active games from repository
    const games = await this.gameRepository.findMany({
      where: { status: '出題中' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        _count: { select: { players: true } },
      },
    });

    // Get total count of active games
    const total = await this.gameRepository.count({
      where: { status: '出題中' },
    });

    // Calculate pagination metadata
    const hasMore = skip + limit < total;
    const nextCursor = hasMore ? String(skip + limit) : null;

    // Transform to list items
    const gameListItems = games.map((game) => this.toListItem(game));

    return {
      games: gameListItems,
      hasMore,
      nextCursor,
      total,
    };
  }

  /**
   * Transform game entity to list item DTO
   */
  private toListItem(game: any): ActiveGameListItem {
    return {
      id: game.id,
      title: game.title,
      createdAt: game.createdAt.toISOString(),
      playerCount: game._count.players,
      playerLimit: game.playerLimit,
      formattedCreatedAt: formatRelativeTime(game.createdAt),
    };
  }
}
