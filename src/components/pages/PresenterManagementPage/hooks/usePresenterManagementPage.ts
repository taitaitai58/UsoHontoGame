// Custom hook for Presenter Management Page
// Feature: 002-game-preparation
// Manages state and business logic for presenter/episode management

import { useEffect, useState } from "react";
import type {
	UsePresenterManagementPageReturn,
	PresenterManagementPageProps,
} from "../PresenterManagementPage.types";
import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";

/**
 * Custom hook for Presenter Management Page
 * Encapsulates all business logic and state management
 *
 * @param props - Hook props including gameId
 * @returns State and event handlers for the page
 */
export function usePresenterManagementPage({
	gameId,
}: PresenterManagementPageProps): UsePresenterManagementPageReturn {
	// State management
	const [presenters, setPresenters] = useState<PresenterWithLieDto[]>([]);
	const [selectedPresenterId, setSelectedPresenterId] = useState<
		string | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Load all presenters for the game
	 * Currently using mock data; will integrate with actual API endpoint
	 */
	const loadPresenters = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Load all presenters for this game
			// Note: This is a simplified approach for MVP
			// In production, we'd have a dedicated endpoint to fetch all game presenters
			const mockPresenters: PresenterWithLieDto[] = [];
			setPresenters(mockPresenters);
		} catch (err) {
			console.error("Failed to load presenters:", err);
			setError("プレゼンターの読み込みに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	// Load presenters on mount and when gameId changes
	useEffect(() => {
		loadPresenters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameId]);

	/**
	 * Handler for when a new presenter is added
	 * Adds the presenter to local state without reloading
	 */
	const handlePresenterAdded = (presenter: PresenterWithLieDto) => {
		setPresenters((prev) => [...prev, presenter]);
	};

	/**
	 * Handler for when a presenter is removed
	 * Reloads the presenter list to reflect changes
	 */
	const handlePresenterRemoved = () => {
		loadPresenters();
	};

	/**
	 * Handler for when an episode is added to a presenter
	 * Reloads the presenter list and clears selection
	 */
	const handleEpisodeAdded = () => {
		loadPresenters();
		setSelectedPresenterId(null);
	};

	/**
	 * Handler for when a presenter is selected for episode editing
	 */
	const handlePresenterSelected = (presenterId: string | null) => {
		setSelectedPresenterId(presenterId);
	};

	// Derived data: find the currently selected presenter
	const selectedPresenter = presenters.find(
		(p) => p.id === selectedPresenterId,
	);

	return {
		presenters,
		selectedPresenterId,
		isLoading,
		error,
		selectedPresenter,
		handlePresenterAdded,
		handlePresenterRemoved,
		handleEpisodeAdded,
		handlePresenterSelected,
	};
}
