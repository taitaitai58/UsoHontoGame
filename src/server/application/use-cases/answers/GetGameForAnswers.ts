// Use Case: GetGameForAnswers
// Fetches game data for answer submission screen (hides isLie)

import { t } from '@/lib/i18n/server';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';

export interface GetGameForAnswersResult {
  success: true;
  data: {
    id: string;
    name: string;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
  };
}

export interface GetGameForAnswersError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type GetGameForAnswersResponse = GetGameForAnswersResult | GetGameForAnswersError;

export class GetGameForAnswers {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<GetGameForAnswersResponse> {
    // Validate game ID
    if (!gameId || gameId.trim() === '') {
      return {
        success: false,
        error: {
          code: 'INVALID_GAME_ID',
          message: await t('errors.invalid'),
        },
      };
    }

    // Fetch game
    let gameIdObj: GameId;
    try {
      gameIdObj = new GameId(gameId);
    } catch {
      // Invalid UUID format - treat as not found
      return {
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: await t('game.gameNotFound'),
        },
      };
    }

    const game = await this.gameRepository.findById(gameIdObj);

    if (!game) {
      return {
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: await t('game.gameNotFound'),
        },
      };
    }

    // Validate game status (reject closed games)
    if (game.status.toString() === '締切') {
      return {
        success: false,
        error: {
          code: 'GAME_CLOSED',
          message: await t('status.labels.closed'),
        },
      };
    }

    // Return game data (without isLie)
    return {
      success: true,
      data: {
        id: game.id.toString(),
        name: game.name ?? '',
        status: game.status.toString(),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
      },
    };
  }
}
