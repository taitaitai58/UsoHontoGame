// GetPresenterEpisodes Use Case
// Feature: 002-game-preparation
// Business logic for retrieving presenter's episodes with access control

import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";
import type { EpisodeWithLieDto } from "../../dto/EpisodeWithLieDto";
import type { PresenterWithLieDto } from "../../dto/PresenterWithLieDto";

export interface GetPresenterEpisodesInput {
	/** Presenter ID to get episodes for */
	presenterId: string;
	/** Requesting user's session ID (for access control) */
	requesterId: string;
}

export interface GetPresenterEpisodesOutput {
	/** Presenter with episodes (including lie markers if authorized) */
	presenter: PresenterWithLieDto;
}

/**
 * GetPresenterEpisodes use case
 * Retrieves a presenter's episodes with access control for lie markers
 *
 * Access Control (FR-006):
 * - Moderator (game creator): Can see all lie markers
 * - Presenter themselves: Can see their own lie marker
 * - Other users: Cannot see lie markers (use EpisodeDto instead)
 *
 * Note: This implementation returns PresenterWithLieDto which includes lie markers.
 * The access control should be enforced at the presentation layer (Server Action)
 * to determine whether to return PresenterWithLieDto or a public version.
 */
export class GetPresenterEpisodes {
	constructor(private gameRepository: IGameRepository) {}

	async execute(
		input: GetPresenterEpisodesInput,
	): Promise<GetPresenterEpisodesOutput> {
		const { presenterId } = input;

		// Check if presenter exists
		const presenterEntity =
			await this.gameRepository.findPresenterById(presenterId);

		if (!presenterEntity) {
			throw new NotFoundError(`Presenter ${presenterId} not found`);
		}

		// Get episodes
		const episodes =
			await this.gameRepository.findEpisodesByPresenterId(presenterId);

		// Map to DTOs
		const episodeDtos: EpisodeWithLieDto[] = episodes.map((episode) => ({
			id: episode.id,
			presenterId: episode.presenterId,
			text: episode.text,
			isLie: episode.isLie,
			createdAt: episode.createdAt,
		}));

		const presenter: PresenterWithLieDto = {
			id: presenterEntity.id,
			gameId: presenterEntity.gameId,
			nickname: presenterEntity.nickname,
			episodes: episodeDtos,
			createdAt: presenterEntity.createdAt,
		};

		return {
			presenter,
		};
	}
}
