// Game List Page Component
// Feature: 002-game-preparation, 008-i18n-support
// Presentational component for displaying game management list

'use client';

import { Header } from '@/components/ui/Header';
import { GameListClient } from '@/components/domain/game/GameListClient';
import { useLanguage } from '@/hooks/useLanguage';
import type { GameListPageErrorProps, GameListPageProps } from './GameListPage.types';

/**
 * GameListPage - Main component for displaying game management
 * Pure presentational component with no business logic
 *
 * Feature 008: Added i18n support
 * @param props - Component props including games data
 */
export function GameListPage({ games }: GameListPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('game.gameManagement')}</h1>
            <p className="mt-2 text-sm text-gray-600">{t('game.gameManagementDescription')}</p>
          </div>
          <a
            href="/games/create"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Add icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('game.newGame')}
          </a>
        </div>

        {/* Game List */}
        <GameListClient games={games} managementView={true} />
      </div>
    </div>
  );
}

/**
 * GameListPageError - Error state component
 * Displayed when game fetching fails
 *
 * @param props - Error props including error message
 */
export function GameListPageError({ errorMessage }: GameListPageErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
