// CreateGame Use Case
// Feature: 002-game-preparation
// FR-001: Create new games with player limits (1-100)
// FR-002: Games start in 準備中 status
// FR-008: Games are identified by UUID

import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { Game } from "@/server/domain/entities/Game";
import { GameId } from "@/server/domain/value-objects/GameId";
import { GameStatus } from "@/server/domain/value-objects/GameStatus";
import type {
	CreateGameInput,
	CreateGameOutput,
} from "@/server/application/dto/GameDto";
import { ValidationError } from "@/server/domain/errors/ValidationError";

/**
 * CreateGame Use Case
 * Creates a new game with specified player limit and optional custom name
 * Games are created in 準備中 (preparation) status
 */
export class CreateGame {
	constructor(private gameRepository: IGameRepository) {}

	/**
	 * Execute the CreateGame use case
	 * @param input CreateGame input with creator ID, optional name, and player limit
	 * @returns Created game data
	 * @throws ValidationError if player limit or name is invalid
	 */
	async execute(input: CreateGameInput): Promise<CreateGameOutput> {
		// Validate player limit (FR-001: 1-100)
		if (input.playerLimit < 1 || input.playerLimit > 100) {
			throw new ValidationError(
				`Player limit must be between 1 and 100 (got ${input.playerLimit})`,
			);
		}

		// Validate name if provided (FR-001a: max 100 chars)
		if (input.name !== undefined && input.name !== null) {
			if (input.name.trim() === '') {
				throw new ValidationError('Game name cannot be empty when provided');
			}
			if (input.name.length > 100) {
				throw new ValidationError('Game name must be 100 characters or less');
			}
		}

		// Generate new game ID (FR-008: UUID)
		const gameId = GameId.generate();

		// Create game entity in 準備中 status (FR-002)
		// Name is optional - if not provided, UI will display UUID (FR-001b)
		const now = new Date();
		const game = new Game(
			gameId,
			input.name ?? null, // Use provided name or null for UUID display
			GameStatus.preparation(), // Always 準備中 for new games
			input.playerLimit,
			0, // New games start with 0 players
			now,
			now,
			input.creatorId, // Session ID of the moderator who created the game
		);

		// Persist to repository
		await this.gameRepository.create(game);

		// Return created game data
		return {
			id: game.id.value,
			name: game.name,
			status: game.status.toString(),
			maxPlayers: game.maxPlayers,
			currentPlayers: game.currentPlayers,
			createdAt: game.createdAt,
		};
	}
}
