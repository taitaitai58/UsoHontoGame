// RemovePresenter Use Case
// Feature: 002-game-preparation
// Business logic for removing a presenter from a game

import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";

export interface RemovePresenterInput {
	/** Presenter ID to remove */
	presenterId: string;
}

export interface RemovePresenterOutput {
	/** Success flag */
	success: boolean;
}

/**
 * RemovePresenter use case
 * Removes a presenter and all their episodes from a game (cascade delete)
 *
 * Business Rules:
 * - Presenter must exist
 * - Removing a presenter cascades to delete all their episodes (FR-014)
 * - Can only remove presenters when game status is 準備中
 */
export class RemovePresenter {
	constructor(private gameRepository: IGameRepository) {}

	async execute(input: RemovePresenterInput): Promise<RemovePresenterOutput> {
		const { presenterId } = input;

		// Check if presenter exists
		const presenter =
			await this.gameRepository.findPresenterById(presenterId);

		if (!presenter) {
			throw new NotFoundError(`Presenter ${presenterId} not found`);
		}

		// Remove presenter (cascade deletes episodes via Prisma)
		await this.gameRepository.removePresenter(presenterId);

		return {
			success: true,
		};
	}
}
