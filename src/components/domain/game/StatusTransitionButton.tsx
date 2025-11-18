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
        announceStatusChange('準備中', '出題中');
        announceSuccess('ゲームが正常に開始されました');

        onSuccess?.('出題中');
      } else {
        // Error animation and feedback
        setAnimationState('error');
        if (buttonRef.current) {
          await animationSequences.buttonError(buttonRef.current);
        }

        const errorMessage = result.errors._form?.[0] || 'ゲームの開始に失敗しました';
        announceError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      // Network error animation and feedback
      setAnimationState('error');
      if (buttonRef.current) {
        await animationSequences.buttonError(buttonRef.current);
      }

      const errorMessage = error instanceof Error ? error.message : 'ゲームの開始に失敗しました';
      announceError(`ネットワークエラー: ${errorMessage}`);
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
    const confirmed = window.confirm('本当にゲームを締切しますか？');
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
        announceStatusChange('出題中', '締切');
        announceSuccess('ゲームが正常に締切されました');

        onSuccess?.('締切');
      } else {
        // Error animation and feedback
        setAnimationState('error');
        if (buttonRef.current) {
          await animationSequences.buttonError(buttonRef.current);
        }

        const errorMessage = result.errors._form?.[0] || 'ゲームの締切に失敗しました';
        announceError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      // Network error animation and feedback
      setAnimationState('error');
      if (buttonRef.current) {
        await animationSequences.buttonError(buttonRef.current);
      }

      const errorMessage = error instanceof Error ? error.message : 'ゲームの締切に失敗しました';
      announceError(`ネットワークエラー: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      // Reset animation state after delay
      setTimeout(() => setAnimationState('idle'), 1000);
    }
  };

  // Don't render anything for closed games
  if (currentStatus === '締切') {
    return null;
  }

  if (currentStatus === '準備中') {
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
        aria-label="ゲームを開始する"
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
              aria-label="読み込み中"
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
            <span id="loading-status">開始中...</span>
          </>
        ) : animationState === 'success' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-green-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label="成功"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            成功!
          </>
        ) : animationState === 'error' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-red-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label="エラー"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            エラー
          </>
        ) : (
          'ゲームを開始'
        )}
      </button>
    );
  }

  if (currentStatus === '出題中') {
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
        aria-label="ゲームを締切する"
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
              aria-label="読み込み中"
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
            <span id="loading-status-close">締切中...</span>
          </>
        ) : animationState === 'success' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-green-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label="成功"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            成功!
          </>
        ) : animationState === 'error' ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-red-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              role="img"
              aria-label="エラー"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            エラー
          </>
        ) : (
          'ゲームを締切'
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
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await startGameAction(formData);

      if (result.success) {
        onSuccess?.('出題中');
      } else {
        const errorMessage = result.errors._form?.[0] || 'ゲームの開始に失敗しました';
        alert(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ゲームの開始に失敗しました';
      alert(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = async () => {
    if (isLoading) return;

    const confirmed = window.confirm('本当にゲームを締切しますか？');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('confirmed', 'true');

      const result = await closeGameAction(formData);

      if (result.success) {
        onSuccess?.('締切');
      } else {
        const errorMessage = result.errors._form?.[0] || 'ゲームの締切に失敗しました';
        alert(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ゲームの締切に失敗しました';
      alert(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === '締切') {
    return null;
  }

  if (currentStatus === '準備中') {
    return (
      <button
        type="button"
        onClick={handleStartGame}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="ゲームを開始する"
        aria-disabled={isLoading}
      >
        {isLoading ? '開始中...' : '開始'}
      </button>
    );
  }

  if (currentStatus === '出題中') {
    return (
      <button
        type="button"
        onClick={handleCloseGame}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="ゲームを締切する"
        aria-disabled={isLoading}
      >
        {isLoading ? '締切中...' : '締切'}
      </button>
    );
  }

  return null;
}
