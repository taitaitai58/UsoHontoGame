/**
 * CloseGameButton Component
 * Feature: 007-game-closure
 * Button for moderators to close active games
 */

'use client';

import { useCloseGame } from '@/components/pages/GameDetailPage/hooks/useCloseGame';
import { useLanguage } from '@/hooks/useLanguage';

export interface CloseGameButtonProps {
  gameId: string;
  gameStatus: '準備中' | '出題中' | '締切';
  onClosed?: () => void;
  className?: string;
}

/**
 * Button component for closing games
 * Only shown when game status is '出題中'
 *
 * Features:
 * - Confirmation dialog before closing
 * - Loading state with disabled button
 * - Error message display
 * - Callback on successful close
 */
export function CloseGameButton({
  gameId,
  gameStatus,
  onClosed,
  className = '',
}: CloseGameButtonProps) {
  const { t } = useLanguage();
  const { closeGame, isClosing, error } = useCloseGame({
    gameId,
    onSuccess: () => {
      onClosed?.();
    },
    onError: (errorMessage) => {
      // Error is already stored in the hook's state
      console.error('Failed to close game:', errorMessage);
    },
  });

  // Only show button when game is in 'active' status
  if (gameStatus !== t('game.status.active')) {
    return null;
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={closeGame}
        disabled={isClosing}
        className={`
          rounded-md px-4 py-2 font-medium text-white
          transition-all duration-200
          ${
            isClosing
              ? 'cursor-not-allowed bg-gray-400 opacity-70'
              : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
          }
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        `}
        aria-label={isClosing ? t('status.labels.closing') : t('status.transition.active.toClosed')}
        aria-busy={isClosing}
      >
        {isClosing ? t('status.labels.closing') : t('status.transition.active.toClosed')}
      </button>

      {error && (
        <div
          className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-800"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
}
