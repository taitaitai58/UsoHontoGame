'use client';

// Presenter Management Page Component
// Feature: 002-game-preparation
// Presentational component for presenter and episode management

import { PresenterList } from '@/components/domain/game/PresenterList';
import { PresenterWithEpisodesForm } from '@/components/domain/game/PresenterWithEpisodesForm';
import { Header } from '@/components/ui/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { usePresenterManagementPage } from './hooks/usePresenterManagementPage';
import type { PresenterManagementPageProps } from './PresenterManagementPage.types';

/**
 * Presenter Management Page
 * Allows moderators to:
 * - Add presenters to a game
 * - Add episodes to presenters (3 per presenter, 1 must be a lie)
 * - View all presenters and their episodes
 * - Remove presenters
 *
 * This is a pure presentational component; all logic is handled by the
 * usePresenterManagementPage custom hook.
 */
export function PresenterManagementPage({ gameId }: PresenterManagementPageProps) {
  const { t } = useLanguage();
  const {
    presenters,
    isLoading,
    error,
    handlePresenterAdded,
    handlePresenterRemoved,
    handlePresenterSelected,
  } = usePresenterManagementPage({ gameId });

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center">
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('presenter.presenterManagement')}
            </h1>
            <p className="mt-2 text-gray-600">{t('presenter.presenterManagementDescription')}</p>
            <div className="mt-4 flex gap-4">
              <a
                href={`/games/${gameId}`}
                className="inline-block text-sm text-blue-600 hover:text-blue-700"
              >
                ← {t('game.gameDetails')}
              </a>
              <a href="/top" className="inline-block text-sm text-gray-600 hover:text-gray-900">
                ← {t('navigation.home')}
              </a>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4" role="alert">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Main Content: Single Column with New Form */}
          <div className="space-y-6">
            {/* New: Inline Episode Registration Form */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {t('presenter.registerPresenterAndEpisodes')}
              </h2>
              <PresenterWithEpisodesForm gameId={gameId} onSuccess={handlePresenterAdded} />
            </div>

            {/* Presenter List */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {t('presenter.presenterList')}
              </h2>
              <PresenterList
                presenters={presenters}
                gameId={gameId}
                onPresenterRemoved={handlePresenterRemoved}
                onPresenterSelected={handlePresenterSelected}
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t('presenter.registrationStatus')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Total Presenters */}
              <div>
                <p className="text-sm text-gray-600">{t('presenter.registeredPresenters')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {presenters.length}
                  <span className="text-sm font-normal text-gray-600">/10</span>
                </p>
              </div>

              {/* Complete Presenters */}
              <div>
                <p className="text-sm text-gray-600">{t('status.labels.completed')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    presenters.filter(
                      (p) =>
                        p.episodes?.length === 3 &&
                        p.episodes?.filter((ep) => ep.isLie).length === 1
                    ).length
                  }
                </p>
              </div>

              {/* Incomplete Presenters */}
              <div>
                <p className="text-sm text-gray-600">{t('status.labels.incomplete')}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    presenters.filter(
                      (p) =>
                        !p.episodes ||
                        p.episodes.length < 3 ||
                        p.episodes.filter((ep) => ep.isLie).length !== 1
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
