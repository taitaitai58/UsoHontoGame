// AddPresenterWithEpisodes Use Case
// Feature: 003-presenter-episode-inline
// Business logic for adding a presenter with 3 episodes in single atomic operation

import { nanoid } from 'nanoid';
import { Episode } from '@/server/domain/entities/Episode';
import { Presenter } from '@/server/domain/entities/Presenter';
import { ValidationError } from '@/server/domain/errors/ValidationError';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { PresenterWithLieDto } from '../../dto/PresenterWithLieDto';

export interface EpisodeInputData {
  text: string;
  isLie: boolean;
}

export interface AddPresenterWithEpisodesInput {
  /** Game ID to add presenter to */
  gameId: string;
  /** Presenter's session nickname */
  nickname: string;
  /** Array of exactly 3 episodes with 1 lie */
  episodes: EpisodeInputData[];
}

export interface AddPresenterWithEpisodesOutput {
  /** The created presenter with episodes */
  presenter: PresenterWithLieDto;
}

/**
 * AddPresenterWithEpisodes use case
 * Creates a new presenter with 3 episodes in a single atomic operation
 *
 * Business Rules:
 * - Game must exist
 * - Game must not have 10 presenters already (maximum limit)
 * - Nickname must not be empty
 * - Must have exactly 3 episodes
 * - Must have exactly 1 lie marker among episodes
 * - All episodes must be 1-1000 characters
 * - Operation is atomic (all-or-nothing)
 *
 * This replaces the 2-step process of:
 * 1. AddPresenter (creates presenter without episodes)
 * 2. AddEpisode x3 (adds episodes separately)
 */
export class AddPresenterWithEpisodes {
  constructor(private gameRepository: IGameRepository) {}

  async execute(input: AddPresenterWithEpisodesInput): Promise<AddPresenterWithEpisodesOutput> {
    const { gameId, nickname, episodes } = input;

    // Validate nickname is not empty
    if (!nickname || nickname.trim().length === 0) {
      throw new ValidationError('Presenter nickname cannot be empty');
    }

    // Validate episodes array has exactly 3 episodes
    if (episodes.length !== 3) {
      throw new ValidationError(
        `Presenter must have exactly 3 episodes (received ${episodes.length})`
      );
    }

    // Validate exactly 1 lie marker
    const lieCount = episodes.filter((ep) => ep.isLie).length;
    if (lieCount !== 1) {
      throw new ValidationError(`Presenter must have exactly 1 lie episode (received ${lieCount})`);
    }

    // Validate all episodes have valid text length
    for (let i = 0; i < episodes.length; i += 1) {
      const episodeText = episodes[i].text;
      if (!episodeText || episodeText.trim().length === 0) {
        throw new ValidationError(`Episode ${i + 1}: text cannot be empty`);
      }
      if (episodeText.length > 1000) {
        throw new ValidationError(
          `Episode ${i + 1}: text cannot exceed 1000 characters (received ${episodeText.length})`
        );
      }
    }

    // Check if game exists by trying to find presenters for the game
    const existingPresenters = await this.gameRepository.findPresentersByGameId(gameId);

    // Validate presenter limit (max 10 presenters per game)
    if (existingPresenters.length >= 10) {
      throw new ValidationError(`Game ${gameId} already has maximum of 10 presenters`);
    }

    // Generate IDs
    const presenterId = nanoid();
    const now = new Date();

    // Create Episode entities
    const episodeEntities = episodes.map((episodeInput) =>
      Episode.create({
        id: nanoid(),
        presenterId,
        text: episodeInput.text,
        isLie: episodeInput.isLie,
        createdAt: now,
      })
    );

    // Create complete Presenter entity with episodes
    const presenterEntity = Presenter.create({
      id: presenterId,
      gameId,
      nickname: nickname.trim(),
      episodes: episodeEntities,
      createdAt: now,
    });

    // Save presenter and episodes atomically
    await this.gameRepository.createPresenterWithEpisodes(presenterEntity, episodeEntities);

    // Map to PresenterWithLieDto
    const presenter: PresenterWithLieDto = {
      id: presenterEntity.id,
      gameId: presenterEntity.gameId,
      nickname: presenterEntity.nickname,
      episodes: episodeEntities.map((ep) => ({
        id: ep.id,
        presenterId: ep.presenterId,
        text: ep.text,
        isLie: ep.isLie,
        createdAt: ep.createdAt,
      })),
      createdAt: presenterEntity.createdAt,
    };

    return {
      presenter,
    };
  }
}
