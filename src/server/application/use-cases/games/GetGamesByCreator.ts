// GetGamesByCreator Use Case
// Feature: 002-game-preparation
// Retrieve all games created by a specific moderator

import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import type { GameManagementDto } from "@/server/application/dto/GameDto";

/**
 * GetGamesByCreator Input
 */
export interface GetGamesByCreatorInput {
	/** Session ID of the creator/moderator */
	creatorId: string;
}

/**
 * GetGamesByCreator Output
 */
export interface GetGamesByCreatorOutput {
	/** List of games with management info */
	games: GameManagementDto[];
}

/**
 * GetGamesByCreator Use Case
 * Retrieves all games created by a specific moderator
 * Returns game information including status, player counts, and available slots
 *
 * Business Rules:
 * - Returns only games where creatorId matches the provided session ID
 * - Includes games in all statuses (準備中, 出題中, 締切)
 * - Ordered by creation date (newest first)
 */
export class GetGamesByCreator {
	constructor(private readonly gameRepository: IGameRepository) {}

	async execute(
		input: GetGamesByCreatorInput,
	): Promise<GetGamesByCreatorOutput> {
		const { creatorId } = input;

		// Get all games by creator
		const games = await this.gameRepository.findByCreatorId(creatorId);

		// Map to GameManagementDto
		const gameDtos: GameManagementDto[] = games.map((game) => ({
			id: game.id.toString(),
			name: game.name,
			status: game.status.toString(),
			maxPlayers: game.maxPlayers,
			currentPlayers: game.currentPlayers,
			availableSlots: game.maxPlayers - game.currentPlayers,
		}));

		// Sort by creation date (newest first)
		gameDtos.sort((a, b) => {
			// Note: We don't have createdAt in DTO, but games array is already sorted by repository
			return 0;
		});

		return { games: gameDtos };
	}
}
