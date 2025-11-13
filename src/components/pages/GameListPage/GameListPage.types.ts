// Type definitions for GameListPage
// Feature: 002-game-preparation

import type { GameDto } from "@/server/application/dto/responses/GameDto";

/**
 * Props for GameListPage component
 */
export interface GameListPageProps {
	/** List of games to display */
	games: GameDto[];
}

/**
 * Props for GameListPageError component
 */
export interface GameListPageErrorProps {
	/** Error message to display */
	errorMessage: string;
}
