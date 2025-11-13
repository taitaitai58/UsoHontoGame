// DeleteGame Use Case
// Feature: 002-game-preparation
// Delete a game with authorization check

import { GameId } from "@/server/domain/value-objects/GameId";
import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";

/**
 * DeleteGame Input DTO
 */
export interface DeleteGameInput {
	/** Game ID to delete */
	gameId: string;
	/** Requester session ID (for authorization) */
	requesterId: string;
}

/**
 * DeleteGame Output DTO
 */
export interface DeleteGameOutput {
	/** Success status */
	success: boolean;
}

/**
 * DeleteGame Use Case
 * Deletes a game with authorization check
 *
 * Business Rules:
 * - Game must exist
 * - Only creator can delete the game
 * - Delete operation cascades to presenters and episodes (handled by repository)
 */
export class DeleteGame {
	constructor(private readonly gameRepository: IGameRepository) {}

	async execute(input: DeleteGameInput): Promise<DeleteGameOutput> {
		const { gameId, requesterId } = input;

		// Find the game
		const game = await this.gameRepository.findById(new GameId(gameId));

		if (!game) {
			throw new NotFoundError(`Game ${gameId} not found`);
		}

		// Authorization: Only creator can delete
		if (game.creatorId !== requesterId) {
			throw new Error("Unauthorized: You can only delete games you created");
		}

		// Delete the game (repository will handle cascade deletion)
		await this.gameRepository.delete(new GameId(gameId));

		return {
			success: true,
		};
	}
}
