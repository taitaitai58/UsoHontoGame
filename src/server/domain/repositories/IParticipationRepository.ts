// Repository Interface: Participation
// Defines data access operations for Participation entity

import type { ParticipationEntity } from '../entities/Participation';

export interface IParticipationRepository {
	/**
	 * Create a new participation record
	 * Uses composite unique constraint (sessionId, gameId)
	 */
	create(participation: ParticipationEntity): Promise<void>;

	/**
	 * Check if a participation exists for a session and game
	 */
	exists(sessionId: string, gameId: string): Promise<boolean>;

	/**
	 * Count total participants for a specific game
	 */
	countByGameId(gameId: string): Promise<number>;

	/**
	 * Find participation record by session and game
	 * Returns null if not found
	 */
	findBySessionAndGame(
		sessionId: string,
		gameId: string,
	): Promise<ParticipationEntity | null>;
}
