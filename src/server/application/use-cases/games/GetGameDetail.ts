// GetGameDetail Use Case
// Feature: 002-game-preparation
// Retrieve detailed information about a specific game

import { GameId } from "@/server/domain/value-objects/GameId";
import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import type { GameManagementDto } from "@/server/application/dto/GameDto";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";

/**
 * GetGameDetail Input
 */
export interface GetGameDetailInput {
	/** Game ID (UUID) */
	gameId: string;
	/** Session ID of the requester (for authorization) */
	requesterId: string;
}

/**
 * GetGameDetail Output
 */
export interface GetGameDetailOutput {
	/** Game information with management details */
	game: GameManagementDto;
}

/**
 * GetGameDetail Use Case
 * Retrieves detailed information about a specific game
 * Includes status, player limits, and presenter counts
 *
 * Business Rules:
 * - Game must exist
 * - Only the creator can view game details (authorization check)
 * - Returns full management information including status
 */
export class GetGameDetail {
	constructor(private readonly gameRepository: IGameRepository) {}

	async execute(input: GetGameDetailInput): Promise<GetGameDetailOutput> {
		const { gameId, requesterId } = input;

		// Find game
		const game = await this.gameRepository.findById(new GameId(gameId));

		if (!game) {
			throw new NotFoundError(`Game ${gameId} not found`);
		}

		// Authorization: Only creator can view game details
		if (game.creatorId !== requesterId) {
			throw new Error("Unauthorized: You can only view games you created");
		}

		// Get presenter count
		const presenters =
			await this.gameRepository.findPresentersByGameId(gameId);

		// Map to GameManagementDto
		const gameDto: GameManagementDto = {
			id: game.id.toString(),
			name: game.name,
			status: game.status.toString(),
			maxPlayers: game.maxPlayers,
			currentPlayers: game.currentPlayers,
			availableSlots: game.maxPlayers - game.currentPlayers,
		};

		return { game: gameDto };
	}
}
