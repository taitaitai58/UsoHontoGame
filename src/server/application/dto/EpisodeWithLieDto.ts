// EpisodeWithLieDto Type
// Feature: 002-game-preparation
// DTO for episode data including confidential lie marker (for moderators/presenters only)

/**
 * EpisodeWithLieDto
 * Used for episode management where lie markers should be visible
 * (e.g., for moderators or presenters editing their own episodes)
 *
 * Security: Only expose this DTO to moderators or the presenter themselves
 * For public episode display, use EpisodeDto which excludes isLie
 */
export interface EpisodeWithLieDto {
	/** Episode UUID */
	id: string;

	/** Presenter UUID this episode belongs to */
	presenterId: string;

	/** Episode text content (1-1000 characters) */
	text: string;

	/** Truth/lie marker - CONFIDENTIAL (FR-006) */
	isLie: boolean;

	/** When episode was created */
	createdAt: Date;
}
