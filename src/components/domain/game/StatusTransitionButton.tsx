/**
 * StatusTransitionButton Component
 * Feature: 004-status-transition, Enhanced feedback
 * Renders appropriate action buttons based on current game status with enhanced animations and feedback
 */

'use client';

import { useRef, useState } from 'react';
import { closeGameAction, startGameAction } from '@/app/actions/game';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { animationSequences } from '@/lib/animations';
import { useLanguage } from '@/hooks/useLanguage';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';

export interface StatusTransitionButtonProps {
  gameId: string;
  currentStatus: GameStatusValue;
  onSuccess?: (newStatus: GameStatusValue) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Button component that renders the appropriate action based on game status
 * - 準備中: Show "ゲームを開始" button
 * - 出題中: Show "ゲームを締切" button with confirmation
 * - 締切: Show no button (no transitions allowed)
 */
export function StatusTransitionButton({
  gameId,
  currentStatus,
  onSuccess,
  onError,
  className = '',
}: StatusTransitionButtonProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'success' | 'error'>('idle');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { announceStatusChange, announceError, announceSuccess } = useAccessibility();

  const handleStartGame = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setAnimationState('idle');

    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await startGameAction(formData);

      if (result.success) {
        // Success animation and feedback
        setAnimationState('success');
        if (buttonRef.current) {
          await animationSequences.buttonSuccess(buttonRef.current);
        }

        // Announce status change to screen readers
        announceStatusChange(t('game.status.preparing'), t('game.status.active'));
        announceSuccess(t('status.messages.gameStarted'));

        onSuccess?.(t('game.status.active') as GameStatusValue);
      } else {
        // Error animation and feedback
        setAnimationState('error');
        if (buttonRef.current) {
          await animationSequences.buttonError(buttonRef.current);
        }

        const errorMessage = result.errors._form?.[0] || t('action.game.start.error');
        announceError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      // Network error animation and feedback
      setAnimationState('error');
      if (buttonRef.current) {
        await animationSequences.buttonError(buttonRef.current);
      }

      const errorMessage = error instanceof Error ? error.message : t('action.game.start.error');
      announceError(`${t('errors.networkError')}: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      // Reset animation state after delay
      setTimeout(() => setAnimationState('idle'), 1000);
    }
  };

  const handleCloseGame = async () => {
    if (isLoading) return;

    // Show confirmation dialog
    const confirmed = window.confirm(t('action.game.close.confirm'));
    if (!confirmed) return;

    setIsLoading(true);
    setAnimationState('idle');

    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('confirmed', 'true');

      const result = await closeGameAction(formData);

      if (result.success) {
        // Success animation and feedback
        setAnimationState('success');
        if (buttonRef.current) {
          await animationSequences.buttonSuccess(buttonRef.current);
        }

        // Announce status change to screen readers
        announceStatusChange(t('game.status.active'), t('game.status.closed'));
        announceSuccess(t('status.messages.gameClosed'));

        onSuccess?.(t('game.status.closed') as GameStatusValue);
      } else {
        // Error animation and feedback
        setAnimationState('error');
        if (buttonRef.current) {
          await animationSequences.buttonError(buttonRef.current);
        }

        const errorMessage = result.errors._form?.[0] || t('action.game.close.error');
        announceError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      // Network error animation and feedback
      setAnimationState('error');
      if (buttonRef.current) {
        await animationSequences.buttonError(buttonRef.current);
      }

      const errorMessage = error instanceof Error ? error.message : t('action.game.close.error');
      announceError(`${t('errors.networkError')}: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      // Reset animation state after delay
      setTimeout(() => setAnimationState('idle'), 1000);
    }
  };

  // Don't render anything for closed games
  if (currentStatus === t('game.status.closed')) {
    return null;
  }

  if (currentStatus === t('game.status.preparing')) {
    const getButtonClasses = () => {
      const baseClasses =
        'inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300';

      if (animationState === 'success') {
        return `${baseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 scale-105 ${className}`;
      } else if (animationState === 'error') {
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse ${className}`;
      } else {
        return `${baseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 ${className}`;
      }
    };

    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={handleStartGame}
        disabled={isLoading}
        className={getButtonClasses()}
        aria-label={t('status.transition.preparing.toActive')}
        aria-disabled={isLoading}
        aria-live="polite"
        aria-describedby={isLoading ? 'loading-status' : undefined}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="img"
              aria-label={t('common.loading')}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span id="loading-status">{t('status.labels.starting')}</span>
          </>
        ) : animationState === 'success' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-green-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label={t('status.labels.success')}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t('messages.success')}
          </>
        ) : animationState === 'error' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-red-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label={t('status.labels.error')}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {t('status.labels.error')}
          </>
        ) : (
          t('status.transition.preparing.toActive')
        )}
      </button>
    );
  }

  if (currentStatus === t('game.status.active')) {
    const getButtonClasses = () => {
      const baseClasses =
        'inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300';

      if (animationState === 'success') {
        return `${baseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 scale-105 ${className}`;
      } else if (animationState === 'error') {
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse ${className}`;
      } else {
        return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 ${className}`;
      }
    };

    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={handleCloseGame}
        disabled={isLoading}
        className={getButtonClasses()}
        aria-label={t('status.transition.active.toClosed')}
        aria-disabled={isLoading}
        aria-live="polite"
        aria-describedby={isLoading ? 'loading-status-close' : undefined}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="img"
              aria-label={t('common.loading')}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span id="loading-status-close">{t('status.labels.closing')}</span>
          </>
        ) : animationState === 'success' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-green-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label={t('status.labels.success')}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t('messages.success')}
          </>
        ) : animationState === 'error' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-red-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label={t('status.labels.error')}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {t('status.labels.error')}
          </>
        ) : (
          t('status.transition.active.toClosed')
        )}
      </button>
    );
  }

  // Should not reach here, but return null as fallback
  return null;
}

/**
 * Compact variant of the StatusTransitionButton for smaller spaces
 */
export function StatusTransitionButtonCompact({
  gameId,
  currentStatus,
  onSuccess,
  onError,
  className = '',
}: StatusTransitionButtonProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await startGameAction(formData);

      if (result.success) {
        onSuccess?.(t('game.status.active') as GameStatusValue);
      } else {
        const errorMessage = result.errors._form?.[0] || t('action.game.start.error');
        alert(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('action.game.start.error');
      alert(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = async () => {
    if (isLoading) return;

    const confirmed = window.confirm(t('action.game.close.confirm'));
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('confirmed', 'true');

      const result = await closeGameAction(formData);

      if (result.success) {
        onSuccess?.(t('game.status.closed') as GameStatusValue);
      } else {
        const errorMessage = result.errors._form?.[0] || t('action.game.close.error');
        alert(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('action.game.close.error');
      alert(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === t('game.status.closed')) {
    return null;
  }

  if (currentStatus === t('game.status.preparing')) {
    return (
      <button
        type="button"
        onClick={handleStartGame}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={t('status.transition.preparing.toActive')}
        aria-disabled={isLoading}
      >
        {isLoading ? t('status.labels.starting') : t('game.startGame')}
      </button>
    );
  }

  if (currentStatus === t('game.status.active')) {
    return (
      <button
        type="button"
        onClick={handleCloseGame}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={t('status.transition.active.toClosed')}
        aria-disabled={isLoading}
      >
        {isLoading ? t('status.labels.closing') : t('game.endGame')}
      </button>
    );
  }

  return null;
}
