// Type definitions for TopPage
// Feature: 001-session-top-page

import type { Game } from "@/server/domain/entities/Game";

/**
 * Props for TopPageNicknameSetup component
 * Displayed when user doesn't have a nickname set
 */
export interface TopPageNicknameSetupProps {
	// No props needed - uses NicknameInput component
}

/**
 * Props for TopPage component
 * Displayed when user has nickname set
 */
export interface TopPageProps {
	/** User's nickname */
	nickname: string;
	/** List of available games */
	games: Game[];
}
