'use client';

// DeleteGameButton Component
// Feature: 002-game-preparation
// Button with confirmation dialog for deleting games

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteGameAction } from '@/app/actions/game';
import { useLanguage } from '@/hooks/useLanguage';

interface DeleteGameButtonProps {
  /** Game ID to delete */
  gameId: string;
  /** Game status (for confirmation message) */
  gameStatus: string;
}

/**
 * Delete Game Button with Confirmation
 * Shows confirmation dialog before deleting a game
 * Provides different messages based on game status
 */
export function DeleteGameButton({ gameId, gameStatus }: DeleteGameButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('gameId', gameId);

        const result = await deleteGameAction(formData);

        if (result.success) {
          // Redirect to game list after successful deletion
          router.push('/games');
        } else {
          setError(result.errors._form?.[0] || t('action.game.delete.error'));
          setShowConfirm(false);
        }
      } catch (err) {
        console.error('Delete game error:', err);
        setError(t('errors.unexpectedError'));
        setShowConfirm(false);
      }
    });
  };

  const _needsConfirmation = gameStatus !== t('game.status.preparing');

  const confirmationMessage =
    gameStatus === t('game.status.active')
      ? t('action.game.delete.confirmActive')
      : gameStatus === t('game.status.closed')
        ? t('action.game.delete.confirmClosed')
        : t('action.game.delete.confirm');

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="w-full rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('game.deleteGame')}
        </button>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-4 text-sm font-medium text-red-900">{confirmationMessage}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? t('common.loading') : t('common.delete')}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
