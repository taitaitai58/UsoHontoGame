// EpisodeDto Type
// Feature: 002-game-preparation
// Public DTO for episode data WITHOUT lie marker (for players/public display)

/**
 * EpisodeDto
 * Public episode data without lie marker
 * Used when displaying episodes to players or in public contexts
 *
 * Security: This DTO intentionally excludes isLie field (FR-006)
 * For moderator/presenter views, use EpisodeWithLieDto
 */
export interface EpisodeDto {
	/** Episode UUID */
	id: string;

	/** Presenter UUID this episode belongs to */
	presenterId: string;

	/** Episode text content (1-1000 characters) */
	text: string;

	/** When episode was created */
	createdAt: Date;
}
