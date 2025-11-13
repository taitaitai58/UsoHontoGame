// AddEpisode Use Case
// Feature: 002-game-preparation
// Business logic for adding an episode to a presenter

import { nanoid } from "nanoid";
import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { Episode } from "@/server/domain/entities/Episode";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";
import { ValidationError } from "@/server/domain/errors/ValidationError";
import type { EpisodeWithLieDto } from "../../dto/EpisodeWithLieDto";

export interface AddEpisodeInput {
	/** Presenter ID to add episode to */
	presenterId: string;
	/** Episode text content (1-1000 characters) */
	text: string;
	/** Whether this episode is the lie */
	isLie: boolean;
}

export interface AddEpisodeOutput {
	/** The created episode */
	episode: EpisodeWithLieDto;
}

/**
 * AddEpisode use case
 * Adds a new episode to a presenter
 *
 * Business Rules:
 * - Presenter must exist
 * - Presenter can have maximum 3 episodes (FR-004)
 * - Exactly 1 episode must be marked as lie (FR-005)
 * - Episode text must be 1-1000 characters (validated by Episode entity)
 * - Can only add episodes when game status is 準備中
 */
export class AddEpisode {
	constructor(private gameRepository: IGameRepository) {}

	async execute(input: AddEpisodeInput): Promise<AddEpisodeOutput> {
		const { presenterId, text, isLie } = input;

		// Check if presenter exists
		const presenter =
			await this.gameRepository.findPresenterById(presenterId);

		if (!presenter) {
			throw new NotFoundError(`Presenter ${presenterId} not found`);
		}

		// Get existing episodes for the presenter
		const existingEpisodes =
			await this.gameRepository.findEpisodesByPresenterId(presenterId);

		// Validate episode limit (FR-004: exactly 3 episodes required)
		if (existingEpisodes.length >= 3) {
			throw new ValidationError(
				`Presenter ${presenterId} already has 3 episodes (maximum reached)`,
			);
		}

		// Validate lie marker constraint (FR-005: exactly 1 lie episode)
		if (isLie) {
			const hasLie = existingEpisodes.some((ep) => ep.isLie);
			if (hasLie) {
				throw new ValidationError(
					`Presenter ${presenterId} already has a lie episode`,
				);
			}
		}

		// Create episode entity
		const episodeId = nanoid();
		const now = new Date();

		const episodeEntity = Episode.create({
			id: episodeId,
			presenterId,
			text: text.trim(),
			isLie,
			createdAt: now,
		});

		// Store episode
		await this.gameRepository.addEpisode(episodeEntity);

		// Map to DTO
		const episode: EpisodeWithLieDto = {
			id: episodeEntity.id,
			presenterId: episodeEntity.presenterId,
			text: episodeEntity.text,
			isLie: episodeEntity.isLie,
			createdAt: episodeEntity.createdAt,
		};

		return {
			episode,
		};
	}
}
