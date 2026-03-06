// GameList component
// Feature: 002-game-preparation
// List component for displaying multiple games

'use client';

import { useLanguage } from '@/hooks/useLanguage';
import type { GameDto, GameManagementDto } from '@/server/application/dto/GameDto';
import { GameCard } from './GameCard';

export interface GameListProps {
  /** Array of games to display */
  games: GameDto[] | GameManagementDto[];
  /** Whether to show management view */
  managementView?: boolean;
  /** Handler for when a game card is clicked */
  onGameClick?: (gameId: string) => void;
  /** Called when copy URL succeeds on a card (e.g. show toast) */
  onCopyUrlSuccess?: (message: string) => void;
}

/**
 * GameList component
 * Displays a list of games with optional empty state
 * Supports both player and management views
 */
export function GameList({
  games,
  managementView = false,
  onGameClick,
  onCopyUrlSuccess,
}: GameListProps) {
  const { t } = useLanguage();

  // Empty state
  if (games.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('emptyState.noGames')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {managementView ? t('emptyState.createFirstGame') : t('emptyState.noAvailableGames')}
        </p>
        {managementView && (
          <div className="mt-6">
            <a
              href="/games/create"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('game.createGame')}
            </a>
          </div>
        )}
      </div>
    );
  }

  // Games list with header
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {managementView ? t('game.createdGames') : t('game.availableGames')}
        </h2>
        <span className="text-sm text-gray-600">{games.length}件</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            managementView={managementView}
            onClick={onGameClick ? () => onGameClick(game.id) : undefined}
            onCopyUrlSuccess={managementView ? onCopyUrlSuccess : undefined}
          />
        ))}
      </div>
    </div>
  );
}
