// Game Data Transfer Objects
// Feature: 002-game-preparation
// Contracts for transferring game data between layers

/**
 * Game DTO for TOP page display
 * Contains only the information needed to show available games
 */
export interface GameDto {
	/** Game ID (UUID) */
	id: string;
	/** Game display name (custom name or defaults to ID) */
	name: string | null;
	/** Available player slots (calculated: maxPlayers - currentPlayers) */
	availableSlots: number;
}

/**
 * CreateGame use case input DTO
 * Contract for creating a new game (FR-001, FR-001a, FR-002, FR-008)
 */
export interface CreateGameInput {
	/** Session ID of the moderator creating the game */
	creatorId: string;
	/** Optional custom game name (max 100 chars, defaults to UUID display) */
	name?: string | null;
	/** Maximum number of players allowed (1-100) */
	playerLimit: number;
}

/**
 * CreateGame use case output DTO
 * Returns the created game entity
 */
export interface CreateGameOutput {
	/** Created game ID */
	id: string;
	/** Game name (optional custom name or null for UUID display) */
	name: string | null;
	/** Game status (always '準備中' for new games) */
	status: string;
	/** Maximum players */
	maxPlayers: number;
	/** Current players (always 0 for new games) */
	currentPlayers: number;
	/** Creation timestamp */
	createdAt: Date;
}

/**
 * Game Management DTO
 * Extended game information for management/moderator views
 * Includes status for status transition operations
 */
export interface GameManagementDto extends GameDto {
	/** Game status (準備中 | 出題中 | 締切) */
	status: string;
	/** Maximum players */
	maxPlayers: number;
	/** Current players */
	currentPlayers: number;
}
