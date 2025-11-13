// PresenterWithLieDto Type
// Feature: 002-game-preparation
// DTO for presenter data including confidential lie markers (for moderators/presenters only)

import type { EpisodeWithLieDto } from "./EpisodeWithLieDto";

/**
 * PresenterWithLieDto
 * Used for presenter management where lie markers should be visible
 * (e.g., for moderators or presenters editing their own episodes)
 *
 * Security: Only expose this DTO to moderators or the presenter themselves
 */
export interface PresenterWithLieDto {
	/** Presenter UUID */
	id: string;

	/** Game UUID this presenter belongs to */
	gameId: string;

	/** Session nickname of the presenter */
	nickname: string;

	/** Episodes with lie markers visible */
	episodes: EpisodeWithLieDto[];

	/** When presenter was added to the game */
	createdAt: Date;
}
