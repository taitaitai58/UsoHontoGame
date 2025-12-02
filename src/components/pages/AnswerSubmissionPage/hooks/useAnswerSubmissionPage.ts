/**
 * useAnswerSubmissionPage Hook
 * Feature: 001-lie-detection-answers
 * Wrapper hook that handles data fetching and coordinates with useAnswerSubmission
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { type Presenter, useAnswerSubmission } from './useAnswerSubmission';

export interface UseAnswerSubmissionPageOptions {
  gameId: string;
}

export interface UseAnswerSubmissionPageReturn {
  formData: {
    presenters: Presenter[];
    selections: Record<string, string>;
    isComplete: boolean;
    isSubmitting: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  handleSelectEpisode: (presenterId: string, episodeId: string) => void;
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
}

/**
 * Transform PresenterWithLieDto to Presenter format (excluding isLie flag)
 * This ensures participants cannot see which episodes are lies
 */
function transformPresenter(dto: PresenterWithLieDto): Presenter {
  return {
    id: dto.id,
    name: dto.nickname,
    episodes: dto.episodes.map((episode) => ({
      id: episode.id,
      text: episode.text,
      // isLie is intentionally excluded for participants
    })),
  };
}

/**
 * Hook that combines data fetching with answer submission logic
 * Provides the API expected by AnswerSubmissionPage component
 */
export function useAnswerSubmissionPage({
  gameId,
}: UseAnswerSubmissionPageOptions): UseAnswerSubmissionPageReturn {
  const { t } = useLanguage();
  const router = useRouter();
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch presenters on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchPresenters() {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Fetch from API endpoint instead of server action
        const response = await fetch(`/api/games/${gameId}/presenters`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        });

        if (!isMounted) return;

        if (response.ok) {
          const result = await response.json();
          // Transform DTO to remove isLie flag
          const transformed = result.presenters.map(transformPresenter);
          setPresenters(transformed);
        } else {
          const error = await response.json();
          setFetchError(error.details || error.error || t('errors.unexpectedError'));
        }
      } catch (_err) {
        if (!isMounted) return;
        setFetchError(t('errors.unexpectedError'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPresenters();

    return () => {
      isMounted = false;
    };
  }, [gameId, t]);

  // Handle successful submission - redirect to top page
  const handleSuccess = useCallback(() => {
    router.push('/');
  }, [router]);

  // Use answer submission hook (only after presenters are loaded)
  const {
    selections,
    selectEpisode,
    isComplete,
    isSubmitting,
    error: submissionError,
    successMessage,
    submit,
    reset,
  } = useAnswerSubmission({
    gameId,
    presenters,
    onSuccess: handleSuccess,
  });

  // Combine errors (fetch error takes precedence)
  const error = fetchError || submissionError;

  // Wrap handlers to match component's expected API
  const handleSelectEpisode = useCallback(
    (presenterId: string, episodeId: string) => {
      selectEpisode(presenterId, episodeId);
    },
    [selectEpisode]
  );

  const handleSubmit = useCallback(async () => {
    await submit();
  }, [submit]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Build formData object
  const formData =
    !isLoading && presenters.length > 0
      ? {
          presenters,
          selections,
          isComplete,
          isSubmitting,
        }
      : null;

  return {
    formData,
    isLoading,
    error,
    successMessage,
    handleSelectEpisode,
    handleSubmit,
    handleReset,
  };
}
