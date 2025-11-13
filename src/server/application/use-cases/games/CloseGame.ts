// CloseGame Use Case
// Feature: 002-game-preparation
// Transitions game from 出題中 to 締切

import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { GameId } from "@/server/domain/value-objects/GameId";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";

export interface CloseGameInput {
	gameId: string;
}

export interface CloseGameOutput {
	success: boolean;
}

/**
 * CloseGame Use Case
 * Transitions a game from 出題中 to 締切 status
 * No additional validation required - any game in 出題中 can be closed
 */
export class CloseGame {
	constructor(private gameRepository: IGameRepository) {}

	async execute(input: CloseGameInput): Promise<CloseGameOutput> {
		const { gameId } = input;

		// Find game
		const game = await this.gameRepository.findById(new GameId(gameId));
		if (!game) {
			throw new NotFoundError(`Game ${gameId} not found`);
		}

		// Transition status (will throw InvalidStatusTransitionError if not in 出題中)
		game.close();

		// Persist
		await this.gameRepository.update(game);

		return { success: true };
	}
}
