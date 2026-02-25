// TOP Page Components
// Feature: 001-session-top-page, 005-top-active-games, 008-i18n-support
// Presentational components for the home/landing page

'use client';

import { ActiveGamesList } from '@/components/domain/game/ActiveGamesList';
import { NicknameInput } from '@/components/domain/session/NicknameInput';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { useLanguage } from '@/hooks/useLanguage';
import type { TopPageProps } from './TopPage.types';

/**
 * TopPageNicknameSetup - Component for nickname setup state
 * Displayed when user doesn't have a nickname set
 * Pure presentational component with no business logic
 *
 * Feature 008: Added Header with language switcher, i18n support
 */
export function TopPageNicknameSetup() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center p-4">
        <NicknameInput />
      </div>
    </div>
  );
}

/**
 * TopPage - Main component for logged-in users
 * Displayed when user has nickname set
 * Pure presentational component with no business logic
 *
 * Feature 005: Now displays only active games (出題中 status)
 * Feature 006: Passes currentSessionId for dashboard authorization
 * Feature 008: Added Header with language switcher, full i18n support
 * Shows empty state when no active games available
 *
 * @param props - Component props including nickname, games, and currentSessionId
 */
export function TopPage({
  nickname,
  games,
  currentSessionId,
  showOnlyFavorite,
  setShowOnlyFavorite,
}: TopPageProps) {
  const { t } = useLanguage();
  const hasGames = games && games.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('session.welcome')}, {nickname}!
            </h1>
            <Button onClick={() => setShowOnlyFavorite(!showOnlyFavorite)}>
              {showOnlyFavorite ? 'Show All Games' : 'Show Only Favorite Games'}
            </Button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{t('game.activeGames')}</h2>
          </div>

          {hasGames ? (
            <ActiveGamesList games={games} currentSessionId={currentSessionId} />
          ) : (
            <EmptyState
              message={t('emptyState.noActiveGames')}
              subMessage={t('emptyState.waitForGames')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
