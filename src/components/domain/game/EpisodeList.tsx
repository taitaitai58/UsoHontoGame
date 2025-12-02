'use client';

// EpisodeList component
// Feature: 002-game-preparation
// Client Component that displays list of episodes with lie markers (confidential)

import { useLanguage } from '@/hooks/useLanguage';
import type { EpisodeWithLieDto } from '@/server/application/dto/EpisodeWithLieDto';

export interface EpisodeListProps {
  /** List of episodes to display */
  episodes: EpisodeWithLieDto[];
  /** Presenter nickname for context */
  presenterNickname?: string;
}

/**
 * EpisodeList component
 * Displays list of episodes with lie markers (confidential - moderator/presenter view only)
 * Shows completion status and lie marker validation
 */
export function EpisodeList({ episodes, presenterNickname }: EpisodeListProps) {
  const { t } = useLanguage();
  const isComplete = episodes.length === 3;
  const hasLie = episodes.some((ep) => ep.isLie);
  const lieCount = episodes.filter((ep) => ep.isLie).length;

  if (episodes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-600">{t('episode.noEpisodes')}</p>
        <p className="mt-2 text-sm text-gray-500">
          {t('episode.episodeManagementDescription')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Status Header */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            {presenterNickname && (
              <h3 className="text-lg font-semibold text-gray-900">{presenterNickname}</h3>
            )}
            <p className="text-sm text-gray-600">{t('episode.registered')}: {episodes.length}/3 {t('game.episodes')}</p>
          </div>
          <div>
            {isComplete && hasLie && lieCount === 1 ? (
              <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                ✓ {t('status.labels.complete')}
              </span>
            ) : (
              <span className="rounded-lg bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                {t('status.labels.incomplete')}
              </span>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {!isComplete && (
          <p className="mt-2 text-sm text-gray-600">
            {t('episode.remainingCount').replace('{count}', String(3 - episodes.length))}
          </p>
        )}
        {isComplete && !hasLie && (
          <p className="mt-2 text-sm text-red-600">⚠ {t('validation.episode.needOneLie')}</p>
        )}
        {lieCount > 1 && (
          <p className="mt-2 text-sm text-red-600">⚠ {t('validation.episode.onlyOneLie')}</p>
        )}
      </div>

      {/* Episodes List */}
      <div className="space-y-3">
        {episodes.map((episode, index) => (
          <div
            key={episode.id}
            className={`rounded-lg border p-4 ${
              episode.isLie ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{t('game.episode')} {index + 1}</span>
              {episode.isLie ? (
                <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                  {t('game.lie')}
                </span>
              ) : (
                <span className="rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                  {t('game.truth')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-900">{episode.text}</p>
            <p className="mt-2 text-xs text-gray-500">{t('episode.characterCount')}: {episode.text.length}/1000</p>
          </div>
        ))}
      </div>
    </div>
  );
}
