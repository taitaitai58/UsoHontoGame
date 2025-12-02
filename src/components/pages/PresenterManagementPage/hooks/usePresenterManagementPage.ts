// Custom hook for Presenter Management Page
// Feature: 002-game-preparation
// Manages state and business logic for presenter/episode management

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import type {
  PresenterManagementPageProps,
  UsePresenterManagementPageReturn,
} from '../PresenterManagementPage.types';

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
  const { t } = useLanguage();

  // State management
  const [presenters, setPresenters] = useState<PresenterWithLieDto[]>([]);
  const [selectedPresenterId, setSelectedPresenterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all presenters for the game
   * Fetches presenters from the API endpoint
   */
  const loadPresenters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch from API endpoint instead of server action
      const response = await fetch(`/api/games/${gameId}/presenters`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.details || error.error || t('errors.unexpectedError'));
        return;
      }

      const result = await response.json();
      setPresenters(result.presenters);
    } catch (err) {
      console.error('Failed to load presenters:', err);
      setError(t('errors.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  }, [gameId, t]);

  // Load presenters on mount and when gameId changes
  useEffect(() => {
    loadPresenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPresenters]);

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
  const selectedPresenter = presenters.find((p) => p.id === selectedPresenterId);

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
