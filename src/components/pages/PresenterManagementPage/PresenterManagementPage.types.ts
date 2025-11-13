// Type definitions for PresenterManagementPage
// Feature: 002-game-preparation

import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";

/**
 * Props for PresenterManagementPage component
 */
export interface PresenterManagementPageProps {
	/** Game ID to manage presenters for */
	gameId: string;
}

/**
 * Return type for usePresenterManagementPage hook
 */
export interface UsePresenterManagementPageReturn {
	/** List of presenters for this game */
	presenters: PresenterWithLieDto[];
	/** Currently selected presenter ID for episode editing */
	selectedPresenterId: string | null;
	/** Loading state */
	isLoading: boolean;
	/** Error message if any */
	error: string | null;
	/** Selected presenter object */
	selectedPresenter: PresenterWithLieDto | undefined;
	/** Handler for when a presenter is added */
	handlePresenterAdded: (presenter: PresenterWithLieDto) => void;
	/** Handler for when a presenter is removed */
	handlePresenterRemoved: () => void;
	/** Handler for when an episode is added */
	handleEpisodeAdded: () => void;
	/** Handler for when a presenter is selected for episode editing */
	handlePresenterSelected: (presenterId: string | null) => void;
}
