// AddPresenter Use Case
// Feature: 002-game-preparation
// Business logic for adding a presenter to a game

import { nanoid } from "nanoid";
import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { Presenter } from "@/server/domain/entities/Presenter";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";
import { ValidationError } from "@/server/domain/errors/ValidationError";
import type { PresenterWithLieDto } from "../../dto/PresenterWithLieDto";
import type { EpisodeWithLieDto } from "../../dto/EpisodeWithLieDto";

export interface AddPresenterInput {
	/** Game ID to add presenter to */
	gameId: string;
	/** Presenter's session nickname */
	nickname: string;
}

export interface AddPresenterOutput {
	/** The created presenter */
	presenter: PresenterWithLieDto;
}

/**
 * AddPresenter use case
 * Adds a new presenter to a game (without episodes initially)
 *
 * Business Rules:
 * - Game must exist (FR-003)
 * - Game must not have 10 presenters already (maximum limit)
 * - Nickname must not be empty (validated by Presenter entity)
 * - Game can only accept new presenters when status is 準備中
 *
 * Note: This use case creates a presenter without episodes.
 * Episodes must be added separately using AddEpisode use case.
 * A "complete presenter" requires exactly 3 episodes with 1 lie (FR-004, FR-005)
 */
export class AddPresenter {
	constructor(private gameRepository: IGameRepository) {}

	async execute(input: AddPresenterInput): Promise<AddPresenterOutput> {
		const { gameId, nickname } = input;

		// Validate nickname is not empty
		if (!nickname || nickname.trim().length === 0) {
			throw new ValidationError("Presenter nickname cannot be empty");
		}

		// Check if game exists
		// Note: Using string ID directly since GameId is a value object for Game entity IDs
		const existingPresenters =
			await this.gameRepository.findPresentersByGameId(gameId);

		// Validate presenter limit (FR-003: max 10 presenters per game)
		if (existingPresenters.length >= 10) {
			throw new ValidationError(
				`Game ${gameId} already has maximum of 10 presenters`,
			);
		}

		// Create incomplete presenter entity (episodes will be added later)
		const presenterId = nanoid();
		const now = new Date();

		const presenterEntity = Presenter.createIncomplete({
			id: presenterId,
			gameId,
			nickname: nickname.trim(),
			episodes: [], // Start with no episodes
			createdAt: now,
		});

		// Store presenter
		await this.gameRepository.addPresenter(presenterEntity);

		// Map to DTO
		const presenter: PresenterWithLieDto = {
			id: presenterEntity.id,
			gameId: presenterEntity.gameId,
			nickname: presenterEntity.nickname,
			episodes: [],
			createdAt: presenterEntity.createdAt,
		};

		return {
			presenter,
		};
	}
}
